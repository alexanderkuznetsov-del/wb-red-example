// Шаблон синхронизации уставки между узлами (стадия 2, опционально).
// Замените <DEVICE_ID> и <CONTROL_NAME> на реальные имена и добавьте
// defineVirtualDevice с этим control'ом (readonly: true).
//
// Простого зеркалирования retained-топика control'а через mosquitto bridge
// недостаточно: при восстановлении связи каждый узел отправляет соседу своё
// текущее retained-значение, и итоговое значение определяется порядком
// доставки сообщений. На тесте более старое значение перезаписало более новое.
// Поэтому значение передаётся вместе с меткой времени (value+ts) в отдельном
// sync-топике, и применяется более новое (last-write-wins). Через bridge
// передаётся только sync-топик (см. mosquitto/wb-ha-bridge.conf.example).
//
// Control должен быть readonly: true, чтобы движок wb-rules сам не обрабатывал
// запись через .../on: иначе её одновременно обработают движок и
// trackMqtt(ON_TOPIC). Публикацию нельзя вешать на whenChanged контрола:
// whenChanged срабатывает асинхронно относительно присваивания dev[...] = ...,
// флаг-защита вокруг присваивания не успевает сработать, и возникает лишняя
// повторная публикация.

var SYNC_TOPIC = "/wbha/sync/<CONTROL_NAME>";
var ON_TOPIC = "/devices/<DEVICE_ID>/controls/<CONTROL_NAME>/on";
var lastAppliedTs = 0;

function applyValue(value, ts) {
    lastAppliedTs = ts;
    dev["<DEVICE_ID>/<CONTROL_NAME>"] = value;
}

// Синхронизация с соседним узлом (приходит локально и через bridge).
trackMqtt(SYNC_TOPIC, function (message) {
    var payload;
    try {
        payload = JSON.parse(message.value);
    } catch (e) {
        return;
    }
    if (!payload.ts || payload.ts <= lastAppliedTs) {
        return;
    }
    applyValue(payload.value, payload.ts);
});

// Запись от пользователя или правила: только здесь создаётся новая метка
// времени.
trackMqtt(ON_TOPIC, function (message) {
    var ts = Date.now();
    applyValue(Number(message.value), ts);
    publish(SYNC_TOPIC, JSON.stringify({ value: Number(message.value), ts: ts }), 1, true);
});
