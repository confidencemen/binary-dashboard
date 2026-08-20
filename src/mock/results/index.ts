import type { DashboardData, DashboardQuery } from '../../types/dashboard';
import pcHadHo70037 from './pc-had-ho7.0.0.37';
import phoneCmmHo70021 from './phone-cmm-ho7.0.0.21';
import phoneCmmHo70037 from './phone-cmm-ho7.0.0.37';

const RESULT_MAP: Record<string, DashboardData> = {
  '手机|CMM(CosmosU)|HO7.0.0.37': phoneCmmHo70037,
  '手机|CMM(CosmosU)|HO7.0.0.21': phoneCmmHo70021,
  'PC|HAD(Harden)|HO7.0.0.37': pcHadHo70037,
};

export function getMockDashboardData(query: Pick<DashboardQuery, 'productLine' | 'product' | 'version'>): DashboardData | undefined {
  return RESULT_MAP[`${query.productLine}|${query.product}|${query.version}`];
}
