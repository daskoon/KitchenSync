@echo off
set "SDK_PATH=C:\Users\transmacsual\AppData\Local\Android\Sdk"
set "JAVA_PATH=C:\Program Files\Java\jdk-17"
set "KEYSTORE_ALIAS=key0"
set "KEYSTORE_PASS=password123"

echo Generating upload-keystore.jks...
keytool -genkeypair -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias %KEYSTORE_ALIAS% -dname "CN=KitchenSync, OU=Development, O=KitchenSync, L=Internet, ST=Cyber, C=US" -storepass %KEYSTORE_PASS% -keypass %KEYSTORE_PASS%

echo Creating android/keystore.properties...
(
echo storeFile=../../upload-keystore.jks
echo storePassword=%KEYSTORE_PASS%
echo keyAlias=%KEYSTORE_ALIAS%
echo keyPassword=%KEYSTORE_PASS%
) > android/keystore.properties

echo Creating android/local.properties...
echo sdk.dir=%SDK_PATH:\=/%> android/local.properties

echo Creating android/gradle.properties...
(
echo org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
echo org.gradle.parallel=true
echo android.useAndroidX=true
echo android.enableJetifier=true
echo org.gradle.java.home=%JAVA_PATH:\=/%
) > android/gradle.properties

echo Setup complete. You can now build the project.
pause
