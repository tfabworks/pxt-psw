enum DARK_BRIGHT {
    //% block="IS_DARK"
    IS_DARK,
    //% block="IS_BRIGHT"
    IS_BRIGHT,
}
enum HOT_COLD {
    //% block="HOT"
    HOT,
    //% block="COLD"
    COLD,
}

enum OutputNumberFormat {
    //% block="INTEGER"
    INTEGER = 0,
    //% block="FLOAT"
    FLOAT = 1
}

//% weight=70 icon="\uf0e7" color=#d2691e block="電気の利用"
namespace kkk {

    /**
     * 自動スイッチをONします。
     */
    //% blockId=turn_on block="Switch Turn ON"
    //% weight=90
    //% group="スイッチ"
    export function turn_on(): void {
        pins.digitalWritePin(DigitalPin.P1, 1);
    }

    /**
     * 自動スイッチをOFFします。
     */
    //% blockId=turn_off block="Switch Turn OFF"
    //% weight=80
    //% group="スイッチ"
    export function turn_off(): void {
        pins.digitalWritePin(DigitalPin.P1, 0);
    }

    /**
     * 人感センサーが反応しているとき真を返します。
     */
    //% blockId=is_man_moving block="Is Human moving"
    //% weight=75
    //% group="人感センサー"
    export function is_man_moving(): boolean {
        if (pins.digitalReadPin(DigitalPin.P2) == 1) {
            return true;
        } else {
            return false;
        }
    }

    let _今まで暗い: boolean = false;
    const _暗い判定閾値: number = 100;
    const _明るい判定閾値: number = 150;
    const _HYSTERESIS: number = _明るい判定閾値 - _暗い判定閾値;

    /**
     * micro:bit本体の明るさセンサーが暗い場合（20未満）に真を返します。
     */
    //% blockId=is_dark block="暗い"
    //% weight=70
    //% group="明るさセンサー"
    export function is_dark(): boolean {
        return _is_dark(_暗い判定閾値, _明るい判定閾値);

    }

	
    /* 暗い判定本体 */
    function _is_dark(暗い判定閾値: number, 明るい判定閾値: number): boolean {
        if ((暗い判定閾値 > 明るい判定閾値)
            || (暗い判定閾値 < 0)
            || (暗い判定閾値 > 255)
            || (明るい判定閾値 < 0)
            || (明るい判定閾値 > 255)) {
            control.assert(false, "threshold is abnormal");
        }

        let 現在の明るさ = light_level();

        const 暗い: boolean = true;
        const 明るい: boolean = false;

        if (_今まで暗い) { //現在まで暗い環境だったとき。明るいかを判定
            if (現在の明るさ > 明るい判定閾値) {
                _今まで暗い = 明るい;
                return 明るい; //現在は明るい
            }
            else {
                _今まで暗い = 暗い;
                return 暗い; //現在は暗い
            }
        }
        else { // 現在まで明るい環境だったとき。暗いかを判定
            if (現在の明るさ < 暗い判定閾値) {
                _今まで暗い = 暗い;
                return 暗い; //現在は暗い
            }
            else {
                _今まで暗い = 明るい;
                return 明るい; //現在は明るい
            }
        }
        control.assert(false);
    }

    /**
     * micro:bit本体の明るさセンサーがしきい値より暗い（または明るい）場合に真を返します。
     * @param light_threshold 判定閾値, eg:100
     * @param dark_bright 暗いか明るいを指定, eg:暗い
     */
    //% blockId=gt_light_level
    //% block="%light_threshold|luxより%dark_bright|"
    //% light_threshold.min=0 light_threshold.max=255
    //% weight=60
    //% group="明るさセンサー"
    export function gt_light_level(light_threshold: number, dark_bright: DARK_BRIGHT): boolean {
        if (_HYSTERESIS < 0) { control.assert(false); }
        if (light_threshold < 0) {
            light_threshold = 0;
        }
        if (light_threshold > 255) {
            light_threshold = 255;
        }

        if (dark_bright === DARK_BRIGHT.IS_DARK) {
            let 暗い判定閾値: number = light_threshold;
            let 明るい判定閾値: number = light_threshold + _HYSTERESIS;
            if (明るい判定閾値 > 255) { 明るい判定閾値 = 255; }
            return _is_dark(暗い判定閾値, 明るい判定閾値);
        }
        else if (dark_bright === DARK_BRIGHT.IS_BRIGHT) {
            let 暗い判定閾値2: number = light_threshold - _HYSTERESIS;
            let 明るい判定閾値2: number = light_threshold;
            if (暗い判定閾値2 < 0) { 暗い判定閾値2 = 0; }
            return !_is_dark(暗い判定閾値2, 明るい判定閾値2);
        }
        control.assert(false); return false;
    }

    /**
     * 明るさセンサーの値をluxで返します
     */
    //% blockId=light_level block="明るさ[lux]"
    //% weight=55
    //% group="明るさセンサー"
    export function light_level(format: OutputNumberFormat = OutputNumberFormat.INTEGER): number {
        pins.i2cWriteNumber(72, 0, NumberFormat.UInt8LE, true)
        pins.i2cWriteNumber(72, 0, NumberFormat.UInt8LE, false)
        pins.i2cWriteNumber(72, 4, NumberFormat.UInt8LE, true)
        return (0.0288 * pins.i2cReadNumber(72, NumberFormat.UInt16LE, false))
    }


    /**
     * micro:bit本体の温度センサーが、しきい値より熱い（または冷たい）場合に真を返します。
     * @param temperatureThreshold 判定閾値, eg: 30
     * @param settingHotCold 熱いか冷たいを指定, eg:熱い
     */
    //% blockId=gt_temperature
    //% block="%temperatureThreshold|℃より%settingHotOrCold|"
    //% weight=50
    //% group="温度センサー"
    export function gt_temperature(temperatureThreshold: number, settingHotCold: HOT_COLD): boolean {
        if (settingHotCold === HOT_COLD.HOT) {
            if (input.temperature() > temperatureThreshold) {
                return true;
            }
            return false;
        }
        if (settingHotCold === HOT_COLD.COLD) {
            if (input.temperature() < temperatureThreshold) {
                return true;
            }
            return false;
        }
        return false;
    }

    /**
     * 温度[℃]を返します。
     * @param format number format, eg: OutputNumberFormat.INTEGER
     */
    //% blockId = get_temperature
    //% block="温度[℃]|| %format"
    //% weight=45
    //% group="温度センサー"
    export function get_temperature(format: OutputNumberFormat = OutputNumberFormat.INTEGER): number {
        if (format === OutputNumberFormat.INTEGER) {
            return Math.round(DS18B20.Temperature() / 100.0);
        }
        return DS18B20.Temperature() / 100.0;
    }

    /**
     * micro:bit本体が揺り動かされた場合に真を返します。
     */
    //% blockId=is_move
    //% block="ゆれた"
    //% weight=40
    //% group="micro:bit本体"
    export function is_move(): boolean {
        let current_acc = input.acceleration(Dimension.Strength)
        if (current_acc < 750 || 1650 < current_acc) {
            return true;
        }
        return false;
    }

    /**
     * 指定された秒数の間、一時停止します。
     * @param sec 秒, eg: 1
     */
    //% blockId=pause_sec
    //% block="一時停止（秒）%sec"
    //% weight=30
    //% group="micro:bit本体"
    export function pause_sec(sec: number) {
        basic.pause(1000 * sec);
    }
}
