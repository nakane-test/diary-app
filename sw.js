// Service Worker for Push Notifications
const CACHE_NAME = 'diary-app-v2';
const NOTIFICATION_TITLE = '今日の日記書いた？';

// プッシュ通知の処理
async function showScheduledNotification() {
  const options = {
    body: '今日も一日お疲れ様でした。今日の出来事を記録しましょう。',
    icon: './vite.svg',
    badge: './vite.svg',
    tag: 'daily-reminder',
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
  };

  await self.registration.showNotification(NOTIFICATION_TITLE, options);
}

// Service Workerのインストール
self.addEventListener('install', (event) => {
  console.log('Service Worker: インストール中');
  self.skipWaiting();
});

// Service Workerのアクティベート
self.addEventListener('activate', (event) => {
  console.log('Service Worker: アクティベート中');
  event.waitUntil(
    Promise.all([
      clients.claim(),
      scheduleDailyNotification()
    ])
  );
});

// プッシュ通知の受信（Push API用）
self.addEventListener('push', (event) => {
  console.log('Service Worker: プッシュ通知を受信');
  event.waitUntil(showScheduledNotification());
});

// 通知クリック時の処理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: 通知がクリックされました');
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // 既に開いているウィンドウがあればフォーカス
        for (const client of clientList) {
          if (client.url && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
  );
});

// 毎日のリマインド通知をスケジュール
async function scheduleDailyNotification() {
  try {
    // 既存のスケジュールをクリア
    const notifications = await self.registration.getNotifications({ tag: 'daily-reminder' });
    for (const notification of notifications) {
      notification.close();
    }

    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(0, 30, 0, 0); // 0:30（テスト用）

    // 今日の0:30が過ぎていたら明日の0:30にする
    if (now >= targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }

    const timeUntilNotification = targetTime.getTime() - now.getTime();
    const minutes = Math.floor(timeUntilNotification / 1000 / 60);
    
    console.log(`Service Worker: ${minutes}分後に通知をスケジュール（テスト用：0:30）`);
    console.log(`Service Worker: 通知時刻 ${targetTime.toLocaleString('ja-JP')}`);

    // 最大24時間のタイムアウト（ブラウザ制限）
    // それ以上の場合は定期チェックにフォールバック
    if (timeUntilNotification > 0 && timeUntilNotification <= 24 * 60 * 60 * 1000) {
      setTimeout(async () => {
        console.log('Service Worker: 通知を表示');
        await showScheduledNotification();
        // 次の日の通知もスケジュール
        scheduleDailyNotification();
      }, timeUntilNotification);
    } else {
      // 24時間を超える場合は定期チェック
      console.log('Service Worker: 定期チェックモードに切り替え');
      
      // 毎分チェック
      setInterval(async () => {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const targetMinutes = 0 * 60 + 30; // 0:30
        
        if (currentMinutes === targetMinutes && now.getSeconds() < 10) {
          console.log('Service Worker: 定期チェックで通知を表示');
          await showScheduledNotification();
        }
      }, 10000); // 10秒ごとにチェック
    }
  } catch (error) {
    console.error('Service Worker: スケジュールエラー', error);
  }
}
