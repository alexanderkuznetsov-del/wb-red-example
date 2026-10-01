// Виртуальное устройство - статус резервирования этого узла (визуализация).
// Данные приходят из MQTT-топиков, которые публикует keepalived
// (notify-скрипт при смене состояния + cron-heartbeat раз в минуту).
// Подписан на те же топики, что и wbha.js, но независимо - чисто
// наблюдательная копия, с арбитражем записи не связана.

defineVirtualDevice("wb_ha_status", {
    title: { en: "HA status", ru: "Статус резервирования" },
    cells: {
        role: { type: "text", value: "unknown", readonly: true, title: { en: "Role", ru: "Роль" } },
        vip: { type: "text", value: "", readonly: true, title: { en: "VIP", ru: "Виртуальный IP" } },
        priority: { type: "value", value: 0, readonly: true, title: { en: "Priority", ru: "Приоритет" } }
    }
});

trackMqtt("/devices/system/controls/role", function (message) {
    dev["wb_ha_status/role"] = message.value;
});

trackMqtt("/devices/system/controls/vip", function (message) {
    dev["wb_ha_status/vip"] = message.value;
});

trackMqtt("/devices/system/controls/priority", function (message) {
    dev["wb_ha_status/priority"] = Number(message.value);
});
