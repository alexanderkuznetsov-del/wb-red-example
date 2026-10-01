// Модуль резервирования пары контроллеров (VRRP/keepalived).
// Роль узла (active/standby/fault) публикуется keepalived-скриптом
// в retained MQTT-топик /devices/system/controls/role на ЭТОМ ЖЕ узле.
//
// Файл идентичен на обоих узлах - ничего per-node здесь не зашито,
// роль узнаётся из MQTT, а не из констант.

var currentRole = "unknown";

trackMqtt("/devices/system/controls/role", function (message) {
    currentRole = message.value;
    log("wbha: роль узла изменилась на \"{}\"", currentRole);
});

// Ведёт себя как dev[], но запись пропускает, если узел не активный.
// Чтение (1 аргумент) - всегда без ограничений, как обычный dev[control].
// Запись (2 аргумента) - только если currentRole === "active".
//   wbha.dev("wb-mr6c_112/K1");        // читать можно всегда
//   wbha.dev("wb-mr6c_112/K1", true);  // писать - только если активны
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
