"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, useI18n } from "@/lib/i18n";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { LLMConnectionIndicator } from "./LLMConnectionIndicator";
import { UserMenu } from "./auth/UserMenu";

export const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { locale, setLocale, t } = useI18n();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {t("medical.app.title")}
            </Link>
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-4">
              <ConnectionIndicator />
              <LLMConnectionIndicator />
              <div className="flex items-center gap-2">
                <label
                  htmlFor="language-select"
                  className="text-sm text-gray-600"
                >
                  {t("nav.language")}
                </label>
                <select
                  id="language-select"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as Locale)}
                  className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="en">{t("nav.language.en")}</option>
                  <option value="pt-BR">{t("nav.language.ptBr")}</option>
                </select>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
