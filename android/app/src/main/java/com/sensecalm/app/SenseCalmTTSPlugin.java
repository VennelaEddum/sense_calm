package com.sensecalm.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(name = "SenseCalmTTS")
public class SenseCalmTTSPlugin extends Plugin {
    private static final String TAG = "SenseCalmTTS";
    private TextToSpeech tts;
    private boolean isInitialized = false;
    private int initStatus = TextToSpeech.ERROR;

    @Override
    public void load() {
        super.load();
        initTTS();
    }

    private synchronized void initTTS() {
        if (tts != null) return;
        try {
            Context context = getContext();
            tts = new TextToSpeech(context, new TextToSpeech.OnInitListener() {
                @Override
                public void onInit(int status) {
                    initStatus = status;
                    if (status == TextToSpeech.SUCCESS) {
                        isInitialized = true;
                        Log.i(TAG, "Native Android TextToSpeech initialized successfully");
                        setupUtteranceListener();
                    } else {
                        isInitialized = false;
                        Log.e(TAG, "Native Android TextToSpeech initialization failed with status: " + status);
                    }
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error initializing TextToSpeech: " + e.getMessage(), e);
        }
    }

    private void setupUtteranceListener() {
        if (tts == null) return;
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {
                JSObject data = new JSObject();
                data.put("utteranceId", utteranceId);
                data.put("status", "playing");
                notifyListeners("ttsStart", data);
            }

            @Override
            public void onDone(String utteranceId) {
                JSObject data = new JSObject();
                data.put("utteranceId", utteranceId);
                data.put("status", "idle");
                notifyListeners("ttsEnd", data);
            }

            @Override
            public void onError(String utteranceId) {
                JSObject data = new JSObject();
                data.put("utteranceId", utteranceId);
                data.put("status", "error");
                data.put("error", "Playback failed");
                notifyListeners("ttsError", data);
            }

            @Override
            public void onError(String utteranceId, int errorCode) {
                JSObject data = new JSObject();
                data.put("utteranceId", utteranceId);
                data.put("status", "error");
                data.put("errorCode", errorCode);
                notifyListeners("ttsError", data);
            }
        });
    }

    @PluginMethod
    public void speak(PluginCall call) {
        String text = call.getString("text");
        if (text == null || text.trim().isEmpty()) {
            call.reject("Text parameter is required and cannot be empty");
            return;
        }

        if (tts == null || !isInitialized) {
            initTTS();
            JSObject res = new JSObject();
            res.put("success", false);
            res.put("error", "TTS_NOT_INITIALIZED");
            res.put("message", "Android Text-to-Speech engine is initializing. Please try again in a moment.");
            call.resolve(res);
            return;
        }

        String lang = call.getString("lang", "en");
        Double rateObj = call.getDouble("rate", 0.9);
        Double pitchObj = call.getDouble("pitch", 1.0);

        float rate = rateObj != null ? rateObj.floatValue() : 0.9f;
        float pitch = pitchObj != null ? pitchObj.floatValue() : 1.0f;

        Locale targetLocale;
        boolean isTelugu = lang != null && (lang.toLowerCase().startsWith("te") || lang.toLowerCase().contains("telugu"));

        if (isTelugu) {
            targetLocale = new Locale("te", "IN");
            int availability = tts.isLanguageAvailable(targetLocale);
            if (availability == TextToSpeech.LANG_MISSING_DATA || availability == TextToSpeech.LANG_NOT_SUPPORTED) {
                JSObject err = new JSObject();
                err.put("success", false);
                err.put("error", "TELUGU_VOICE_MISSING");
                err.put("message", "Telugu voice package is not installed on this device. You can install it in Android Text-to-Speech settings.");
                call.resolve(err);
                return;
            }
        } else {
            // English: try en-IN first if requested, otherwise en-US or default English
            if (lang != null && lang.equalsIgnoreCase("en-in")) {
                Locale inLocale = new Locale("en", "IN");
                if (tts.isLanguageAvailable(inLocale) >= TextToSpeech.LANG_AVAILABLE) {
                    targetLocale = inLocale;
                } else {
                    targetLocale = Locale.US;
                }
            } else {
                targetLocale = Locale.US;
            }

            int availability = tts.isLanguageAvailable(targetLocale);
            if (availability < TextToSpeech.LANG_AVAILABLE) {
                targetLocale = Locale.getDefault();
            }
        }

        try {
            tts.setLanguage(targetLocale);
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);

            String utteranceId = UUID.randomUUID().toString();
            Bundle params = new Bundle();
            params.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, 1.0f);

            int speakResult = tts.speak(text, TextToSpeech.QUEUE_FLUSH, params, utteranceId);
            if (speakResult == TextToSpeech.SUCCESS) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("utteranceId", utteranceId);
                ret.put("language", targetLocale.toLanguageTag());
                call.resolve(ret);
            } else {
                JSObject ret = new JSObject();
                ret.put("success", false);
                ret.put("error", "SPEAK_FAILED");
                ret.put("message", "Android TextToSpeech engine returned error code: " + speakResult);
                call.resolve(ret);
            }
        } catch (Exception e) {
            Log.e(TAG, "speak exception: " + e.getMessage(), e);
            JSObject ret = new JSObject();
            ret.put("success", false);
            ret.put("error", "EXCEPTION");
            ret.put("message", e.getMessage());
            call.resolve(ret);
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        try {
            if (tts != null) {
                tts.stop();
            }
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to stop speech: " + e.getMessage());
        }
    }

    @PluginMethod
    public void getEngineStatus(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("initialized", isInitialized);
        ret.put("initStatus", initStatus);

        if (tts != null) {
            ret.put("defaultEngine", tts.getDefaultEngine() != null ? tts.getDefaultEngine() : "Unknown");

            // Check Telugu availability
            Locale teLocale = new Locale("te", "IN");
            int teAvailable = tts.isLanguageAvailable(teLocale);
            boolean isTeluguOk = (teAvailable >= TextToSpeech.LANG_AVAILABLE);
            ret.put("isTeluguAvailable", isTeluguOk);
            ret.put("teluguStatusCode", teAvailable);

            // Check English availability
            Locale enLocale = Locale.US;
            int enAvailable = tts.isLanguageAvailable(enLocale);
            boolean isEnglishOk = (enAvailable >= TextToSpeech.LANG_AVAILABLE);
            ret.put("isEnglishAvailable", isEnglishOk);
            ret.put("englishStatusCode", enAvailable);

            // Voice count
            try {
                Set<Voice> voices = tts.getVoices();
                ret.put("voicesCount", voices != null ? voices.size() : 0);
            } catch (Exception e) {
                ret.put("voicesCount", 0);
            }

            Locale currentLocale = tts.getLanguage();
            ret.put("currentLanguage", currentLocale != null ? currentLocale.toLanguageTag() : "none");
        } else {
            ret.put("defaultEngine", "None");
            ret.put("isTeluguAvailable", false);
            ret.put("isEnglishAvailable", false);
            ret.put("voicesCount", 0);
            ret.put("currentLanguage", "none");
        }

        call.resolve(ret);
    }

    @PluginMethod
    public void getVoices(PluginCall call) {
        JSArray list = new JSArray();
        if (tts != null) {
            try {
                Set<Voice> voices = tts.getVoices();
                if (voices != null) {
                    for (Voice voice : voices) {
                        JSObject v = new JSObject();
                        v.put("name", voice.getName());
                        v.put("lang", voice.getLocale() != null ? voice.getLocale().toLanguageTag() : "unknown");
                        v.put("requiresNetwork", voice.isNetworkConnectionRequired());
                        list.put(v);
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "getVoices error: " + e.getMessage());
            }
        }
        JSObject ret = new JSObject();
        ret.put("voices", list);
        call.resolve(ret);
    }

    @PluginMethod
    public void openTtsSettings(PluginCall call) {
        try {
            Intent intent = new Intent();
            intent.setAction("com.android.settings.TTS_SETTINGS");
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("success", true);
            call.resolve(ret);
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(android.provider.Settings.ACTION_SETTINGS);
                fallback.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception ex) {
                call.reject("Could not open settings: " + ex.getMessage());
            }
        }
    }

    @Override
    protected void handleOnDestroy() {
        super.handleOnDestroy();
        if (tts != null) {
            try {
                tts.stop();
                tts.shutdown();
                tts = null;
                isInitialized = false;
            } catch (Exception e) {
                Log.w(TAG, "Error shutting down TTS: " + e.getMessage());
            }
        }
    }
}
