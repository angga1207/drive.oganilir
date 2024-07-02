const path = require('path');
const supportedLngs = ['da', 'de', 'el', 'en', 'es', 'fr', 'hu', 'it', 'id', 'ja', 'pl', 'pt', 'ru', 'sv', 'tr', 'zh', 'ae'];
import themeConfig from '@/theme.config';
export const ni18nConfig = {
    fallbackLng: [themeConfig.locale || 'id'],
    supportedLngs,
    ns: ['translation'],
    react: { useSuspense: false },
    backend: {
        loadPath: path.resolve(`/locales/{{lng}}.json`),
    },
};
