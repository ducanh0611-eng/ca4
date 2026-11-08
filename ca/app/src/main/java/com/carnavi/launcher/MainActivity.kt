package com.carnavi.launcher

import android.Manifest
import android.annotation.SuppressLint
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.MediaStore
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.view.WindowManager
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : AppCompatActivity(), LocationListener {

    private lateinit var webView: WebView
    private var locationManager: LocationManager? = null
    private var currentSpeedKmH: Float = 0f
    private var currentLat: Double = 10.7963
    private var currentLng: Double = 106.7214
    private var currentBearing: Float = 0f
    private var hasRealGpsFix: Boolean = false

    private var mediaPlayer: MediaPlayer? = null
    private var isPlayingAudio: Boolean = false

    private val requiredPermissions: Array<String>
        get() {
            val list = mutableListOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                list.add(Manifest.permission.READ_MEDIA_AUDIO)
            } else {
                list.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
            return list.toTypedArray()
        }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        val grantedFine = results[Manifest.permission.ACCESS_FINE_LOCATION] == true
        val grantedCoarse = results[Manifest.permission.ACCESS_COARSE_LOCATION] == true
        if (grantedFine || grantedCoarse) {
            startLocationUpdates()
        }
        webView.post {
            webView.evaluateJavascript("if (window.onPermissionsResult) { window.onPermissionsResult(); }", null)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        hideSystemUI()

        webView = WebView(this)
        setContentView(webView)

        setupWebView()
        checkAndRequestPermissions()
        startLocationUpdates()

        // Load via secure HTTPS domain so YouTube IFrame gets valid HTTP Referer (resolves Error 153)
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    private fun hideSystemUI() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.insetsController?.let { controller ->
                controller.hide(WindowInsets.Type.statusBars() or WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        } else {
            @Suppress("DEPRECATION")
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    or View.SYSTEM_UI_FLAG_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            )
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val s = webView.settings
        s.javaScriptEnabled = true
        s.domStorageEnabled = true
        s.databaseEnabled = true
        s.setGeolocationEnabled = true
        s.mediaPlaybackRequiresUserGesture = false
        s.allowFileAccess = true
        s.allowContentAccess = true
        s.cacheMode = WebSettings.LOAD_DEFAULT
        s.useWideViewPort = true
        s.loadWithOverviewMode = true
        s.displayZoomControls = false
        s.builtInZoomControls = false

        // Realistic modern mobile Chrome user-agent
        s.userAgentString = "Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            s.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // Bridge to allow JavaScript in web view to talk to Kotlin
        webView.addJavascriptInterface(CarNaviBridge(), "CarNaviApp")

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.grant(request.resources)
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView?,
                request: WebResourceRequest?
            ): WebResourceResponse? {
                val url = request?.url ?: return null
                return assetLoader.shouldInterceptRequest(url)
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file://")) {
                    return false
                }
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val missing = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
        }
    }

    @SuppressLint("MissingPermission")
    private fun startLocationUpdates() {
        val hasFine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
        if (!hasFine && !hasCoarse) {
            return
        }

        try {
            locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val providers = locationManager?.allProviders ?: emptyList()

            if (locationManager?.isProviderEnabled(LocationManager.GPS_PROVIDER) == true) {
                locationManager?.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 1.0f, this)
            }
            if (locationManager?.isProviderEnabled(LocationManager.NETWORK_PROVIDER) == true) {
                locationManager?.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000L, 1.0f, this)
            }
            if (providers.contains(LocationManager.PASSIVE_PROVIDER)) {
                locationManager?.requestLocationUpdates(LocationManager.PASSIVE_PROVIDER, 1000L, 1.0f, this)
            }

            var bestLoc: Location? = null
            for (p in providers) {
                try {
                    val loc = locationManager?.getLastKnownLocation(p)
                    if (loc != null) {
                        if (bestLoc == null || loc.time > bestLoc.time) {
                            bestLoc = loc
                        }
                    }
                } catch (_: Exception) {}
            }

            bestLoc?.let { onLocationChanged(it) }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onLocationChanged(location: Location) {
        currentLat = location.latitude
        currentLng = location.longitude
        currentBearing = location.bearing
        hasRealGpsFix = true
        currentSpeedKmH = if (location.hasSpeed()) location.speed * 3.6f else 0f

        val json = JSONObject().apply {
            put("lat", currentLat)
            put("lng", currentLng)
            put("speed", currentSpeedKmH.toInt())
            put("bearing", currentBearing)
            put("hasFix", true)
        }
        webView.post {
            webView.evaluateJavascript("if (window.onGpsUpdate) { window.onGpsUpdate($json); }", null)
        }
    }

    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
    override fun onProviderEnabled(provider: String) {
        startLocationUpdates()
    }
    override fun onProviderDisabled(provider: String) {}

    // Handle physical / system back button on Android to return to Home Screen
    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        webView.evaluateJavascript("if (window.handleAppBack) { window.handleAppBack(); } else { 'unhandled'; }") { result ->
            val unquoted = result?.replace("\"", "") ?: "unhandled"
            if (unquoted != "handled") {
                super.onBackPressed()
            }
        }
    }

    inner class CarNaviBridge {

        @JavascriptInterface
        fun getGpsData(): String {
            return JSONObject().apply {
                put("lat", currentLat)
                put("lng", currentLng)
                put("speed", currentSpeedKmH.toInt())
                put("bearing", currentBearing)
                put("hasFix", hasRealGpsFix)
            }.toString()
        }

        @JavascriptInterface
        fun refreshGpsLocation() {
            runOnUiThread {
                startLocationUpdates()
            }
        }

        @JavascriptInterface
        fun scanLocalMusic(): String {
            val list = JSONArray()
            val uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI
            val projection = arrayOf(
                MediaStore.Audio.Media._ID,
                MediaStore.Audio.Media.TITLE,
                MediaStore.Audio.Media.ARTIST,
                MediaStore.Audio.Media.DURATION,
                MediaStore.Audio.Media.DATA
            )
            val selection = "${MediaStore.Audio.Media.IS_MUSIC} != 0"
            val sortOrder = "${MediaStore.Audio.Media.TITLE} ASC"

            try {
                contentResolver.query(uri, projection, selection, null, sortOrder)?.use { cursor ->
                    val idCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media._ID)
                    val titleCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.TITLE)
                    val artistCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.ARTIST)
                    val durationCol = cursor.getColumnIndexOrThrow(MediaStore.Audio.Media.DURATION)

                    while (cursor.moveToNext()) {
                        val id = cursor.getLong(idCol)
                        val title = cursor.getString(titleCol) ?: "Unknown Title"
                        val artist = cursor.getString(artistCol) ?: "Unknown Artist"
                        val duration = cursor.getLong(durationCol)
                        val contentUri = ContentUris.withAppendedId(uri, id).toString()

                        val obj = JSONObject().apply {
                            put("id", id)
                            put("title", title)
                            put("artist", artist)
                            put("duration", duration)
                            put("uri", contentUri)
                        }
                        list.put(obj)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            return list.toString()
        }

        @JavascriptInterface
        fun playAudio(uriString: String): Boolean {
            return try {
                mediaPlayer?.release()
                mediaPlayer = MediaPlayer().apply {
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                            .setUsage(AudioAttributes.USAGE_MEDIA)
                            .build()
                    )
                    setDataSource(this@MainActivity, Uri.parse(uriString))
                    prepare()
                    start()
                }
                isPlayingAudio = true
                true
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }

        @JavascriptInterface
        fun pauseAudio() {
            try {
                mediaPlayer?.let {
                    if (it.isPlaying) {
                        it.pause()
                        isPlayingAudio = false
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun resumeAudio() {
            try {
                mediaPlayer?.let {
                    if (!it.isPlaying) {
                        it.start()
                        isPlayingAudio = true
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun seekAudio(positionMs: Int) {
            try {
                mediaPlayer?.seekTo(positionMs)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        @JavascriptInterface
        fun getAudioPlaybackState(): String {
            val isPlaying = mediaPlayer?.isPlaying ?: false
            val currentPos = mediaPlayer?.currentPosition ?: 0
            val duration = mediaPlayer?.duration ?: 0
            return JSONObject().apply {
                put("isPlaying", isPlaying)
                put("currentPos", currentPos)
                put("duration", duration)
            }.toString()
        }

        @JavascriptInterface
        fun openExternalApp(packageName: String): Boolean {
            return try {
                val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                if (launchIntent != null) {
                    startActivity(launchIntent)
                    true
                } else false
            } catch (e: Exception) {
                false
            }
        }

        @JavascriptInterface
        fun launchVoiceAssistant() {
            try {
                val intent = Intent(Intent.ACTION_VOICE_COMMAND).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(intent)
            } catch (e: Exception) {
                try {
                    val intent = Intent(Intent.ACTION_WEB_SEARCH).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    startActivity(intent)
                } catch (ex: Exception) {
                    ex.printStackTrace()
                }
            }
        }

        @JavascriptInterface
        fun requestPermissions() {
            runOnUiThread {
                checkAndRequestPermissions()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        locationManager?.removeUpdates(this)
        mediaPlayer?.release()
        mediaPlayer = null
    }
}
