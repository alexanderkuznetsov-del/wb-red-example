#!/bin/sh
# Раз в минуту повторно публикует роль и приоритет этого узла в MQTT.
# Нужен на случай, если брокер потерял retained-сообщение (перезапуск
# mosquitto), а состояние VRRP не менялось и keepalived не опубликовал
# роль заново.
# Запускается по cron (/etc/cron.d/wb-ha-role-heartbeat): * * * * *
#
# Роль берётся из состояния VRRP-экземпляра: по сигналу USR1 keepalived
# записывает свои данные в /tmp/keepalived.data (строка "State = ...").
# Если состояние получить не удалось, узел считается в роли fault.
#
# Константа PRIORITY задаётся отдельно на каждом узле (150 на .111, 100 на .112),
# как и в wb-ha-notify.sh.
PRIORITY=150
VRRP_INSTANCE="VI_WB_PAIR"
DUMP_FILE="/tmp/keepalived.data"

rm -f "$DUMP_FILE"
STATE=""
if systemctl kill --signal=USR1 --kill-who=main keepalived 2>/dev/null; then
    sleep 1
    STATE=$(awk -v inst="$VRRP_INSTANCE" '
        $0 ~ "^ VRRP Instance = " inst "$" { found = 1; next }
        found && /^ VRRP Instance = / { exit }
        found && $1 == "State" && $2 == "=" { print $3; exit }
    ' "$DUMP_FILE" 2>/dev/null)
fi

case "$STATE" in
    MASTER) ROLE="active" ;;
    BACKUP) ROLE="standby" ;;
    *)      ROLE="fault" ;;
esac

mosquitto_pub -r -t "/devices/system/controls/role" -m "$ROLE"
mosquitto_pub -r -t "/devices/system/controls/priority" -m "$PRIORITY"
