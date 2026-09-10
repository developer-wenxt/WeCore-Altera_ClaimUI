import { SessionService } from '../core/services/session.service';

const sessionService = new SessionService();

const apiMap: Record<string, string> = {
  '100046': 'https://wecoreuat1.wecorephoenixgroup.com/api/Zambia/AlteraClaim/api',
  '100047': 'https://wecoreuat1.wecorephoenixgroup.com/api/Botswana/AlteraClaim/api',
  '100048': 'https://wecoreuat1.wecorephoenixgroup.com/api/Mozambique/AlteraClaim/api',
  '100049': 'https://wecoreuat1.wecorephoenixgroup.com/api/Swaziland/AlteraClaim/api',
  '100050': 'https://wecoreuat1.wecorephoenixgroup.com/api/Namibia/AlteraClaim/api',
};

export const environment = {
  production: false,

  get apiUrl(): string {
    return apiMap[sessionService.getCompanyId() ?? ''] ?? '';
  },

wecoreUrl: 'https://wecoreuat1.wecorephoenixgroup.com/api/EwayCommonApi',
  wecoreBaseUrl: 'https://wecoreuat1.wecorephoenixgroup.com/Eway/#'
};