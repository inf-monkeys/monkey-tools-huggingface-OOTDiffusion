/* eslint-disable @typescript-eslint/ban-ts-comment */
// https://stackoverflow.com/questions/20533735/anyway-to-set-proxy-setting-in-passportjs
import http, { RequestOptions } from 'http';
import https from 'https';
import tunnel from 'tunnel';
import { config } from '../config';
import { logger } from '../logger';

const proxyUrl = config.proxy.url;
const matchDomains = config.proxy.matchDomains;
if (proxyUrl) {
  logger.info(`Use proxy ${proxyUrl} for domains: ${matchDomains}`);
  const proxy = new URL(proxyUrl);
  const tunnelingAgent = tunnel.httpsOverHttp({
    proxy: {
      host: proxy.hostname!,
      port: Number(proxy.port!),
    },
  });

  const oldhttpsreq = https.request;
  // @ts-ignore
  https.request = function (options: any, callback: any) {
    const { protocol, port, path } = options;
    const host = options.host || options.hostname;
    const url = `${protocol || ''}//${host}:${port || ''}${path}`;
    if (
      matchDomains.some(function (domain) {
        return url.includes(domain);
      })
    ) {
      logger.info(`使用代理 ${proxyUrl} 访问地址：${url}`);
      (options as RequestOptions).agent = tunnelingAgent;
      // @ts-ignore
      return oldhttpsreq.call(null, options, callback);
    }
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    return oldhttpsreq.apply(https, arguments);
  };

  const oldhttpreq = http.request;
  // @ts-ignore
  http.request = function (options: any, callback: any) {
    const { protocol, port, path } = options;
    const host = options.host || options.hostname;
    const url = `${protocol || ''}//${host}:${port || ''}${path}`;
    if (
      matchDomains.some(function (domain) {
        return url.includes(domain);
      })
    ) {
      logger.info(`使用代理 ${proxyUrl} 访问地址：${url}`);
      (options as RequestOptions).agent = tunnelingAgent;
      // @ts-ignore
      return oldhttpreq.call(null, options, callback);
    }
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    return oldhttpreq.apply(http, arguments);
  };
}
