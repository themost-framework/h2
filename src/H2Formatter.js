import {SqlFormatter, SqlUtils} from '@themost/query';
import util from 'util';

class H2Formatter extends SqlFormatter {
    /**
     * @constructor
     */
    constructor() {
        super();
        this.settings = {
            nameFormat:H2Formatter.NAME_FORMAT,
            forceAlias:true
        };
    }

    static NAME_FORMAT = '"$1"';

    escapeName(name) {
        if (typeof name === 'string') {
            if (/^(\w+)\.(\w+)$/g.test(name)) {
                return name.replace(/(\w+)/g, H2Formatter.NAME_FORMAT);
            }
            return name.replace(/(\w+)$|^(\w+)$/g, H2Formatter.NAME_FORMAT);
        }
        return name;
    }

    escape(value, unquoted) {
        if (value===null || typeof value==='undefined')
            return SqlUtils.escape(null);

        if(typeof value==='string') {
            if (unquoted) {
                return value.replace(/'/g, "''");
            }
            return '\'' + value.replace(/'/g, "''") + '\'';
        }

        if (typeof value==='boolean')
            return value ? 1 : 0;
        if (typeof value === 'object')
        {
            if (value instanceof Date)
                return this.escapeDate(value);
            if (value.hasOwnProperty('$name'))
                return this.escapeName(value.$name);
        }
        if (unquoted)
            return value.valueOf();
        else
            return SqlUtils.escape(value);
    }

    /**
     * @param {Date|*} val
     * @returns {string}
     */
    escapeDate(val) {
        /*
        Important Note
        H2 database engine uses server timezone while inserting date values.
        
        Tip #1: convert date to GMT: new Date(val.valueOf() + val.getTimezoneOffset() * 60000); 
        */
        const year   = val.getFullYear();
        const month  = zeroPad(val.getMonth() + 1, 2);
        const day    = zeroPad(val.getDate(), 2);
        const hour   = zeroPad(val.getHours(), 2);
        const minute = zeroPad(val.getMinutes(), 2);
        const second = zeroPad(val.getSeconds(), 2);
        const datetime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        const offset = val.getTimezoneOffset(), timezone = (offset<=0 ? '+' : '-') + zeroPad(-Math.floor(offset/60),2) + ':' + zeroPad(offset%60,2);
        return "'" + datetime.concat(timezone) + "'";
    }

    /**
     * Implements length(a) expression formatter.
     * @param {*} p0
     * @returns {string}
     */
    $length(p0) {
        return util.format('LENGTH(%s)', this.escape(p0));
    }

    $day(p0) {
        return util.format('DAY_OF_MONTH(%s)', this.escape(p0));
    }

    $date(p0) {
        return util.format('CAST(%s AS DATE)', this.escape(p0));
    }

    $mod(p0, p1) {
        //validate params
        if (p0 == null || p1 == null)
            return '0';
        return util.format('MOD(%s,%s)', this.escape(p0), this.escape(p1));
    }

    $bit(p0, p1) {
        //validate params
        if (p0 == null || p1 == null)
            return '0';
        return util.format('BITAND(%s,%s)', this.escape(p0), this.escape(p1));
    }
}

export {
    H2Formatter
}