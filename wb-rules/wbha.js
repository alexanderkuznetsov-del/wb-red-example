// Модуль проверки роли при записи для резервированной пары (VRRP/keepalived).
// Роль узла (active/standby/fault) публикует wb-ha-notify.sh в retained
// MQTT-топик /devices/system/controls/role на этом же узле.
//
// Файл одинаков на обоих узлах: настроек под конкретный узел в нём нет,
// роль берётся из MQTT.

var currentRole = "unknown";

trackMqtt("/devices/system/controls/role", function (message) {
    currentRole = message.value;
    log("wbha: роль узла изменилась на \"{}\"", currentRole);
});

// Работает как dev[], но запись выполняет только на активном узле.
// Чтение (1 аргумент) - всегда, как обычный dev[control].
// Запись (2 аргумента) - только если currentRole === "active".
//   wbha.dev("wb-mr6c_112/K1");        // чтение - всегда
//   wbha.dev("wb-mr6c_112/K1", true);  // запись - только на активном узле
exports.dev = function (control, value) {
    if (arguments.length < 2) {
        return dev[control];
    }
    if (currentRole === "active") {
        dev[control] = value;
    } else {
        log.warning("wbha: запись в \"{}\" пропущена - узел в роли \"{}\"", control, currentRole);
    }
};

// Текущая роль - для правил, которым нужно знать её напрямую.
exports.getRole = function () {
    return currentRole;
};
