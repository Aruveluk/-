/**
 * 工具函数库
 * 用途：提供常用的格式化函数
 */

/**
 * 格式化价格（分转元）
 * @param price - 价格（分）
 * @param decimals - 小数位数，默认2位
 */
export function formatPrice(price: number | string | undefined | null, decimals: number = 2): string {
    if (price === undefined || price === null || price === '') {
        return '0.00';
    }
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) {
        return '0.00';
    }
    return num.toFixed(decimals);
}

/**
 * 格式化库存
 */
export function formatStock(stock: number | undefined | null): string {
    if (stock === undefined || stock === null) {
        return '0';
    }
    return stock.toString();
}

/**
 * 格式化日期时间
 */
export function formatDateTime(date: Date | string | number | undefined | null): string {
    if (!date) return '-';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}