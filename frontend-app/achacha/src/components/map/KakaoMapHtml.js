import { KAKAO_MAP_API_KEY } from '@env';

export const getKakaoMapHtml = () => {
  return `
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
     <title>카카오맵</title>
     <style>
       body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
       #map { width: 100%; height: 100%; }
     </style>
   </head>
   <body>
     <div id="map"></div>

     <script>
       var map = null;
       var storeMarkers = [];
       
       function debugLog(message) {
         if (window.ReactNativeWebView) {
           window.ReactNativeWebView.postMessage(JSON.stringify({
             type: 'log',
             message: message
           }));
         }
       }

       function debugError(message) {
         if (window.ReactNativeWebView) {
           window.ReactNativeWebView.postMessage(JSON.stringify({
             type: 'error',
             message: message
           }));
         }
       }

       document.addEventListener('DOMContentLoaded', function() {
         const script = document.createElement('script');
         script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_API_KEY}&autoload=false';
         
         script.onload = function() {
           debugLog('카카오맵 SDK 스크립트 로드 완료');
           
           kakao.maps.load(function() {
             debugLog('카카오맵 SDK 초기화 완료, 지도 생성 시작');
             
             try {
               var mapContainer = document.getElementById('map');
               if (!mapContainer) {
                 debugError('맵 컨테이너를 찾을 수 없습니다.');
                 return;
               }
               
               var mapOption = { 
                 center: new kakao.maps.LatLng(37.566826, 126.9786567),
                 level: 4
               };

               map = new kakao.maps.Map(mapContainer, mapOption);
               
               debugLog('카카오맵 생성 성공');
               
               // 지도 이동 완료 이벤트 리스너 추가
               kakao.maps.event.addListener(map, 'idle', function() {
                 const center = map.getCenter();
                 debugLog('지도 이동 완료. 중심: ' + center.getLat() + ', ' + center.getLng());
                 if (window.ReactNativeWebView) {
                   window.ReactNativeWebView.postMessage(JSON.stringify({
                     type: 'mapMoved',
                     latitude: center.getLat(),
                     longitude: center.getLng()
                   }));
                 }
               });
               
               if (window.ReactNativeWebView) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                   type: 'mapLoaded',
                   success: true,
                   message: '카카오맵 로드 완료'
                 }));
               }
             } catch (error) {
               debugError('지도 생성 중 오류: ' + error.message);
               
               if (window.ReactNativeWebView) {
                 window.ReactNativeWebView.postMessage(JSON.stringify({
                   type: 'mapLoaded',
                   success: false,
                   error: error.message
                 }));
               }
             }
           });
         };
         
         script.onerror = function(error) {
           debugError('카카오맵 SDK 로드 실패: ' + error);
         };
         
         document.head.appendChild(script);
       });
     </script>
   </body>
   </html>
 `;
};
