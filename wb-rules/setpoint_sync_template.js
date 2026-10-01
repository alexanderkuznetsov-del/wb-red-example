// Шаблон синхронизации уставки между узлами (стадия 2, опционально).
// Подставить вместо <SYNC_TOPIC>/<ON_TOPIC>/<device>/<control> реальные
// имена и добавить defineVirtualDevice с этим control'ом (readonly: true).
//
// Голый mirror retained-топика control'а через mosquitto bridge
// НЕДОСТАТОЧЕН: при реконнекте после разрыва сети каждая сторона отдаёт
// другой СВОЙ текущий retained-статус, и чьё значение "победит", зависит
// от порядка доставки, а не от реальной свежести (проверено живьём -
// более старое значение однажды перезаписало более новое). Фикс - value+ts
// в отдельном sync-топике, last-write-wins по метке времени; бриджится
// только sync-топик, не сам control (см. mosquitto/wb-ha-bridge.conf.example).
//
// Control обязательно readonly: true - движок сам не должен обрабатывать
// запись через .../on (иначе он же и наш trackMqtt(ON_TOPIC) будут
// гоняться за одним и тем же событием). Логика паблиша НЕ вешается на
// whenChanged контрола - whenChanged в wb-rules срабатывает асинхронно
// относительно самого присваивания dev[...] = ..., guard-флаг вокруг
// такого присваивания не успевает сработать и даёт лишний эхо-паблиш.

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

// Реальная запись пользователя/правила - единственное место, где рождается
// новая метка времени.
trackMqtt(ON_TOPIC, function (message) {
    var ts = Date.now();
    applyValue(Number(message.value), ts);
    publish(SYNC_TOPIC, JSON.stringify({ value: Number(message.value), ts: ts }), 1, true);
});
