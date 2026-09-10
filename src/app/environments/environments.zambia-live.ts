import { SessionService } from '../core/services/session.service';

const sessionService = new SessionService();

const apiMap: Record<string, string> = {
  '100046': 'https://wecorephoenixgroup.com/api/Zambia/AlteraClaim',
  '100047': 'https://wecorephoenixgroup.com/api/Botswana/AlteraClaim',
  '100048': 'https://wecorephoenixgroup.com/api/Mozambique/AlteraClaim',
  '100049': 'https://wecorephoenixgroup.com/api/Swaziland/AlteraClaim',
  '100050': 'https://wecorephoenixgroup.com/api/Namibia/AlteraClaim',
};

export const environment = {
  production: false,

  get apiUrl(): string {
    return apiMap[sessionService.getCompanyId() ?? ''] ?? '';
  },

wecoreUrl: 'https://wecorephoenixgroup.com/api/EwayCommonApi',
  wecoreBaseUrl: 'https://wecorephoenixgroup.com/Eway/#'
};