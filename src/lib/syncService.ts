import { supabase, isSupabaseConfigured } from "./supabaseClient";
import type {
  CaregiverProfile,
  ChildProfile,
  AACCardItem,
  EmotionCheckInRecord,
  TimelineStepItem,
  Preferences,
  DBCaregiverProfile,
  DBChildProfile,
  DBAACCard,
  DBEmotionLog,
  DBSensoryPreferences,
  DBRoutine,
  DBRoutineStep,
} from "@/types";

const SYNC_QUEUE_KEY = "sense_calm_sync_queue_v1";

interface SyncQueueItem {
  id: string;
  type: "aac_card" | "emotion_log" | "routine_step" | "sensory_pref" | "child_profile";
  action: "upsert" | "delete";
  payload: any;
  timestamp: number;
}

function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: SyncQueueItem[]) {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn("Failed to persist sync queue:", err);
  }
}

export function queueSyncItem(item: Omit<SyncQueueItem, "id" | "timestamp">) {
  const queue = getSyncQueue();
  queue.push({
    ...item,
    id: `${item.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  });
  saveSyncQueue(queue);
}

// -------------------------------------------------------------
// CAREGIVER PROFILES
// -------------------------------------------------------------
export async function getOrCreateCaregiverProfile(
  userId: string,
  email: string,
  fullName?: string
): Promise<CaregiverProfile | null> {
  if (!isSupabaseConfigured) return null;

  try {
    // 1. Try to fetch existing profile
    const { data, error } = await supabase
      .from("caregiver_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.warn("Error fetching caregiver profile:", error);
    }

    if (data) {
      const p = data as DBCaregiverProfile;
      return {
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        role: (p.role as CaregiverProfile["role"]) || "caregiver",
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    }

    // 2. If not found, create new profile
    const name = fullName || email.split("@")[0] || "Caregiver";
    const { data: inserted, error: insertErr } = await supabase
      .from("caregiver_profiles")
      .insert({
        id: userId,
        full_name: name,
        email: email,
        role: "caregiver",
      })
      .select()
      .single();

    if (insertErr) {
      console.warn("Error inserting caregiver profile:", insertErr);
      return {
        id: userId,
        fullName: name,
        email: email,
        role: "caregiver",
      };
    }

    const res = inserted as DBCaregiverProfile;
    return {
      id: res.id,
      fullName: res.full_name,
      email: res.email,
      role: (res.role as CaregiverProfile["role"]) || "caregiver",
      createdAt: res.created_at,
      updatedAt: res.updated_at,
    };
  } catch (err) {
    console.error("Exception in getOrCreateCaregiverProfile:", err);
    return null;
  }
}

// -------------------------------------------------------------
// CHILD PROFILES
// -------------------------------------------------------------
export async function fetchChildProfilesFromDB(
  caregiverId: string
): Promise<ChildProfile[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from("child_profiles")
      .select("*")
      .eq("caregiver_id", caregiverId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error fetching child profiles:", error);
      return [];
    }

    if (!data) return [];

    return data.map((d: DBChildProfile): ChildProfile => ({
      id: d.id,
      caregiverId: d.caregiver_id,
      name: d.name,
      age: d.age || undefined,
      gender: d.gender || undefined,
      preferredLanguage: "en",
      preferredVoiceURI: "",
      preferredCommMode: (d.preferred_comm_mode as ChildProfile["preferredCommMode"]) || "aac",
      sensorySensitivities: d.sensory_sensitivities || [],
      favoriteCalmingTools: d.favorite_calming_tools || [],
      avatarEmoji: d.avatar_emoji || "🐰",
      favoriteCardIds: [],
      favoriteActivities: [],
      frequentlyUsedSentences: [],
      caregiverPIN: d.caregiver_pin || "",
      notes: "",
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch (err) {
    console.error("fetchChildProfilesFromDB exception:", err);
    return [];
  }
}

export async function createChildProfileInDB(
  child: Omit<ChildProfile, "id">,
  caregiverId: string
): Promise<ChildProfile | null> {
  if (!isSupabaseConfigured) {
    return {
      ...child,
      id: `local_child_${Date.now()}`,
      caregiverId,
    };
  }

  try {
    const insertPayload = {
      caregiver_id: caregiverId,
      name: child.name,
      age: child.age || null,
      gender: child.gender || null,
      preferred_comm_mode: child.preferredCommMode || "aac",
      sensory_sensitivities: child.sensorySensitivities || [],
      favorite_calming_tools: child.favoriteCalmingTools || [],
      avatar_emoji: child.avatarEmoji || "🐰",
      caregiver_pin: child.caregiverPIN || null,
      is_active: true,
    };

    const { data, error } = await supabase
      .from("child_profiles")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.warn("Error inserting child profile:", error);
      queueSyncItem({
        type: "child_profile",
        action: "upsert",
        payload: { ...child, caregiverId },
      });
      return {
        ...child,
        id: `queued_child_${Date.now()}`,
        caregiverId,
      };
    }

    const d = data as DBChildProfile;
    return {
      id: d.id,
      caregiverId: d.caregiver_id,
      name: d.name,
      age: d.age || undefined,
      gender: d.gender || undefined,
      preferredLanguage: child.preferredLanguage || "en",
      preferredVoiceURI: child.preferredVoiceURI || "",
      preferredCommMode: (d.preferred_comm_mode as ChildProfile["preferredCommMode"]) || "aac",
      sensorySensitivities: d.sensory_sensitivities || [],
      favoriteCalmingTools: d.favorite_calming_tools || [],
      avatarEmoji: d.avatar_emoji || "🐰",
      favoriteCardIds: child.favoriteCardIds || [],
      favoriteActivities: child.favoriteActivities || [],
      frequentlyUsedSentences: child.frequentlyUsedSentences || [],
      caregiverPIN: d.caregiver_pin || "",
      notes: child.notes || "",
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    };
  } catch (err) {
    console.error("createChildProfileInDB exception:", err);
    return null;
  }
}

export async function updateChildProfileInDB(
  childId: string,
  updates: Partial<ChildProfile>,
  caregiverId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const updatePayload: Record<string, any> = {};
    if (updates.name !== undefined) updatePayload.name = updates.name;
    if (updates.age !== undefined) updatePayload.age = updates.age;
    if (updates.gender !== undefined) updatePayload.gender = updates.gender;
    if (updates.preferredCommMode !== undefined) updatePayload.preferred_comm_mode = updates.preferredCommMode;
    if (updates.sensorySensitivities !== undefined) updatePayload.sensory_sensitivities = updates.sensorySensitivities;
    if (updates.favoriteCalmingTools !== undefined) updatePayload.favorite_calming_tools = updates.favoriteCalmingTools;
    if (updates.avatarEmoji !== undefined) updatePayload.avatar_emoji = updates.avatarEmoji;
    if (updates.caregiverPIN !== undefined) updatePayload.caregiver_pin = updates.caregiverPIN;

    const { error } = await supabase
      .from("child_profiles")
      .update(updatePayload)
      .eq("id", childId)
      .eq("caregiver_id", caregiverId);

    if (error) {
      console.warn("Error updating child profile in DB:", error);
      queueSyncItem({
        type: "child_profile",
        action: "upsert",
        payload: { childId, updates, caregiverId },
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("updateChildProfileInDB exception:", err);
    return false;
  }
}

// -------------------------------------------------------------
// AAC CARDS
// -------------------------------------------------------------
export async function fetchAACCardsFromDB(
  childId: string,
  caregiverId: string
): Promise<AACCardItem[]> {
  if (!isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from("aac_cards")
      .select("*")
      .eq("child_id", childId)
      .eq("caregiver_id", caregiverId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching AAC cards from DB:", error);
      return [];
    }

    if (!data) return [];

    return data.map((d: DBAACCard): AACCardItem => ({
      id: d.id,
      emoji: d.emoji || "✨",
      text: d.label,
      teluguText: d.telugu_label,
      category: d.category as AACCardItem["category"],
      color: "text-[#3D6945]",
      bgColor: "bg-[#EAF3EC]",
      borderColor: "border-[#C5DEC8]",
      isCustom: true,
      imageUrl: d.image_url || undefined,
      familiarRole: d.is_familiar_person ? d.label : undefined,
      usageCount: d.usage_count || 0,
      childId: d.child_id,
      caregiverId: d.caregiver_id,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  } catch (err) {
    console.error("fetchAACCardsFromDB exception:", err);
    return [];
  }
}

export async function saveAACCardToDB(
  card: AACCardItem,
  childId: string,
  caregiverId: string
): Promise<string | null> {
  if (!isSupabaseConfigured) return card.id;

  try {
    const payload = {
      id: card.id.startsWith("custom_") || card.id.startsWith("card_") ? undefined : card.id,
      child_id: childId,
      caregiver_id: caregiverId,
      label: card.text,
      telugu_label: card.teluguText,
      emoji: card.emoji || null,
      image_url: card.imageUrl || null,
      category: card.category || "custom",
      is_familiar_person: Boolean(card.familiarRole),
      usage_count: card.usageCount || 0,
    };

    const { data, error } = await supabase
      .from("aac_cards")
      .upsert(payload)
      .select("id")
      .single();

    if (error) {
      console.warn("saveAACCardToDB error, queueing:", error);
      queueSyncItem({
        type: "aac_card",
        action: "upsert",
        payload: { card, childId, caregiverId },
      });
      return card.id;
    }

    return (data as any)?.id || card.id;
  } catch (err) {
    console.error("saveAACCardToDB exception:", err);
    return card.id;
  }
}

export async function deleteAACCardFromDB(
  cardId: string,
  caregiverId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const { error } = await supabase
      .from("aac_cards")
      .delete()
      .eq("id", cardId)
      .eq("caregiver_id", caregiverId);

    if (error) {
      console.warn("deleteAACCardFromDB error, queueing:", error);
      queueSyncItem({
        type: "aac_card",
        action: "delete",
        payload: { cardId, caregiverId },
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("deleteAACCardFromDB exception:", err);
    return false;
  }
}

// -------------------------------------------------------------
// EMOTION LOGS
// -------------------------------------------------------------
export async function logEmotionCheckInToDB(
  record: EmotionCheckInRecord,
  childId: string,
  caregiverId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const payload = {
      child_id: childId,
      caregiver_id: caregiverId,
      emotion_id: record.emotionId,
      intensity: record.intensity,
      trigger_id: record.reasonId || null,
      notes: record.actionLabel ? `Action: ${record.actionLabel}` : null,
      consent_given: true,
      created_at: record.timestamp || new Date().toISOString(),
    };

    const { error } = await supabase.from("emotion_logs").insert(payload);

    if (error) {
      console.warn("logEmotionCheckInToDB error, queueing:", error);
      queueSyncItem({
        type: "emotion_log",
        action: "upsert",
        payload: { record, childId, caregiverId },
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("logEmotionCheckInToDB exception:", err);
    return false;
  }
}

// -------------------------------------------------------------
// SENSORY PREFERENCES
// -------------------------------------------------------------
export async function fetchSensoryPreferencesFromDB(
  childId: string,
  caregiverId: string
): Promise<Partial<Preferences> | null> {
  if (!isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from("sensory_preferences")
      .select("*")
      .eq("child_id", childId)
      .eq("caregiver_id", caregiverId)
      .maybeSingle();

    if (error || !data) return null;

    const d = data as DBSensoryPreferences;
    return {
      sensoryTheme: d.sensory_theme as any,
      brightnessOverlay: d.brightness_overlay as any,
      reducedMotion: d.reduced_motion,
      quietMode: d.quiet_mode,
      speechEnabled: d.speech_enabled,
      ttsLanguage: d.tts_language as any,
      ttsRate: Number(d.tts_rate) || 0.88,
      ttsVoiceURI: d.tts_voice_uri || "",
      ambientSound: d.ambient_sound as any,
      ambientVolume: Number(d.ambient_volume) || 0.4,
      silentMode: d.silent_mode,
      muted: d.silent_mode,
    };
  } catch (err) {
    console.error("fetchSensoryPreferencesFromDB exception:", err);
    return null;
  }
}

export async function saveSensoryPreferencesToDB(
  prefs: Preferences,
  childId: string,
  caregiverId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const payload = {
      child_id: childId,
      caregiver_id: caregiverId,
      sensory_theme: prefs.sensoryTheme || "default",
      brightness_overlay: prefs.brightnessOverlay || "normal",
      reduced_motion: Boolean(prefs.reducedMotion),
      quiet_mode: Boolean(prefs.quietMode),
      speech_enabled: Boolean(prefs.speechEnabled),
      tts_language: prefs.ttsLanguage || "en",
      tts_rate: prefs.ttsRate || 0.88,
      tts_voice_uri: prefs.ttsVoiceURI || null,
      ambient_sound: prefs.ambientSound || "none",
      ambient_volume: prefs.ambientVolume || 0.4,
      silent_mode: Boolean(prefs.silentMode),
    };

    const { error } = await supabase
      .from("sensory_preferences")
      .upsert(payload, { onConflict: "child_id" });

    if (error) {
      console.warn("saveSensoryPreferencesToDB error, queueing:", error);
      queueSyncItem({
        type: "sensory_pref",
        action: "upsert",
        payload: { prefs, childId, caregiverId },
      });
      return false;
    }
    return true;
  } catch (err) {
    console.error("saveSensoryPreferencesToDB exception:", err);
    return false;
  }
}

// -------------------------------------------------------------
// LEARNING PROGRESS
// -------------------------------------------------------------
export async function saveLearningProgressToDB(
  gameName: string,
  points: number,
  correct: number,
  total: number,
  difficulty: string,
  streak: number,
  childId: string,
  caregiverId: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  try {
    const payload = {
      child_id: childId,
      caregiver_id: caregiverId,
      game_name: gameName,
      points,
      correct_answers: correct,
      total_answers: total,
      difficulty,
      streak,
      completed_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("learning_progress").insert(payload);
    if (error) {
      console.warn("saveLearningProgressToDB error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("saveLearningProgressToDB exception:", err);
    return false;
  }
}

// -------------------------------------------------------------
// ROUTINE STEPS
// -------------------------------------------------------------
export async function fetchRoutineStepsFromDB(
  childId: string,
  caregiverId: string
): Promise<TimelineStepItem[]> {
  if (!isSupabaseConfigured) return [];

  try {
    // 1. Get or create primary routine
    let { data: routine } = await supabase
      .from("routines")
      .select("id")
      .eq("child_id", childId)
      .eq("caregiver_id", caregiverId)
      .maybeSingle();

    if (!routine) return [];

    const { data: steps, error } = await supabase
      .from("routine_steps")
      .select("*")
      .eq("routine_id", routine.id)
      .order("step_number", { ascending: true });

    if (error || !steps) return [];

    return steps.map((s: DBRoutineStep): TimelineStepItem => ({
      id: s.id,
      stepNumber: s.step_number,
      title: s.title,
      teluguTitle: s.telugu_title,
      instruction: s.instruction || "",
      teluguInstruction: "",
      timeHint: s.time_hint || "",
      emoji: s.emoji,
      completed: s.completed,
    }));
  } catch (err) {
    console.error("fetchRoutineStepsFromDB exception:", err);
    return [];
  }
}

// -------------------------------------------------------------
// FLUSH PENDING QUEUE (ONLINE RESYNC)
// -------------------------------------------------------------
export async function flushSyncQueue(): Promise<void> {
  if (!isSupabaseConfigured || typeof window === "undefined" || !window.navigator.onLine) {
    return;
  }

  const queue = getSyncQueue();
  if (queue.length === 0) return;

  const remaining: SyncQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === "aac_card") {
        if (item.action === "upsert") {
          await saveAACCardToDB(item.payload.card, item.payload.childId, item.payload.caregiverId);
        } else if (item.action === "delete") {
          await deleteAACCardFromDB(item.payload.cardId, item.payload.caregiverId);
        }
      } else if (item.type === "emotion_log") {
        await logEmotionCheckInToDB(item.payload.record, item.payload.childId, item.payload.caregiverId);
      } else if (item.type === "sensory_pref") {
        await saveSensoryPreferencesToDB(item.payload.prefs, item.payload.childId, item.payload.caregiverId);
      }
    } catch {
      remaining.push(item);
    }
  }

  saveSyncQueue(remaining);
}
