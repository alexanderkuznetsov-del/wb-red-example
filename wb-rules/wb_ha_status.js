// Виртуальное устройство «Статус резервирования» для отображения роли узла.
// Данные приходят из MQTT-топиков, которые публикуют wb-ha-notify.sh (при смене
// состояния VRRP) и wb-ha-role-heartbeat.sh (раз в минуту по cron).
// Подписка на те же топики, что и в wbha.js, независимая: устройство только
// отображает роль и на проверку роли при записи не влияет.

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
