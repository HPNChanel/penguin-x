import React from 'react'
import { useTranslation } from 'react-i18next'
import { Languages, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
]

interface LanguageSwitcherProps {
  className?: string
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode)
      // Update document language
      document.documentElement.lang = languageCode
      
      // Announce the language change to screen readers
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = `Language changed to ${languages.find(l => l.code === languageCode)?.name}`
      document.body.appendChild(announcement)
      
      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("hover-scale focus-visible-ring", className)}
          aria-label={`${t('settings.language')}: ${currentLanguage.name}`}
        >
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t('settings.language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => {
          const isSelected = i18n.language === language.code
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={cn(
                "flex items-center justify-between cursor-pointer focus-visible-ring",
                isSelected && "bg-accent"
              )}
              aria-current={isSelected ? 'true' : 'false'}
            >
              <div className="flex items-center space-x-2">
                <span aria-hidden="true">{language.flag}</span>
                <span>{language.name}</span>
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-primary" aria-hidden="true" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
