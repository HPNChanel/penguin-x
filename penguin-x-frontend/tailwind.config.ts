import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class", "class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'fade-in': 'fadeIn 200ms cubic-bezier(0, 0, 0.2, 1)',
  			'fade-out': 'fadeOut 150ms cubic-bezier(0.4, 0, 1, 1)',
  			'scale-in': 'scaleIn 200ms cubic-bezier(0, 0, 0.2, 1)',
  			'scale-out': 'scaleOut 150ms cubic-bezier(0.4, 0, 1, 1)',
  			'slide-down': 'slideDown 200ms cubic-bezier(0, 0, 0.2, 1)',
  			'slide-up': 'slideUp 200ms cubic-bezier(0, 0, 0.2, 1)',
  			'slide-right': 'slideRight 220ms cubic-bezier(0, 0, 0.2, 1)',
  			'slide-left': 'slideLeft 220ms cubic-bezier(0, 0, 0.2, 1)',
  			'bounce-gentle': 'bounceGentle 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  			'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'loading-bar': 'loadingBar 1.5s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'modal-in': 'modalIn 250ms cubic-bezier(0, 0, 0.2, 1)',
  			'modal-out': 'modalOut 200ms cubic-bezier(0.4, 0, 1, 1)',
  			'drawer-in': 'drawerIn 300ms cubic-bezier(0, 0, 0.2, 1)',
  			'drawer-out': 'drawerOut 250ms cubic-bezier(0.4, 0, 1, 1)',
  		},
  		keyframes: {
  			fadeIn: {
  				'from': { opacity: '0' },
  				'to': { opacity: '1' },
  			},
  			fadeOut: {
  				'from': { opacity: '1' },
  				'to': { opacity: '0' },
  			},
  			scaleIn: {
  				'from': { opacity: '0', transform: 'scale(0.96)' },
  				'to': { opacity: '1', transform: 'scale(1)' },
  			},
  			scaleOut: {
  				'from': { opacity: '1', transform: 'scale(1)' },
  				'to': { opacity: '0', transform: 'scale(0.96)' },
  			},
  			slideDown: {
  				'from': { opacity: '0', transform: 'translateY(-10px)' },
  				'to': { opacity: '1', transform: 'translateY(0)' },
  			},
  			slideUp: {
  				'from': { opacity: '0', transform: 'translateY(10px)' },
  				'to': { opacity: '1', transform: 'translateY(0)' },
  			},
  			slideRight: {
  				'from': { opacity: '0', transform: 'translateX(-20px)' },
  				'to': { opacity: '1', transform: 'translateX(0)' },
  			},
  			slideLeft: {
  				'from': { opacity: '0', transform: 'translateX(20px)' },
  				'to': { opacity: '1', transform: 'translateX(0)' },
  			},
  			bounceGentle: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-4px)' },
  			},
  			pulseSoft: {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.7' },
  			},
  			loadingBar: {
  				'0%': { transform: 'translateX(-100%)' },
  				'50%': { transform: 'translateX(0%)' },
  				'100%': { transform: 'translateX(100%)' },
  			},
  			shimmer: {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' },
  			},
  			modalIn: {
  				'from': { opacity: '0', transform: 'scale(0.96) translateY(-8px)' },
  				'to': { opacity: '1', transform: 'scale(1) translateY(0)' },
  			},
  			modalOut: {
  				'from': { opacity: '1', transform: 'scale(1) translateY(0)' },
  				'to': { opacity: '0', transform: 'scale(0.96) translateY(-8px)' },
  			},
  			drawerIn: {
  				'from': { opacity: '0', transform: 'translateX(-100%)' },
  				'to': { opacity: '1', transform: 'translateX(0)' },
  			},
  			drawerOut: {
  				'from': { opacity: '1', transform: 'translateX(0)' },
  				'to': { opacity: '0', transform: 'translateX(-100%)' },
  			},
  		},
  		transitionDuration: {
  			'250': '250ms',
  			'350': '350ms',
  		},
  		transitionTimingFunction: {
  			'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
  			'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'natural-in': 'cubic-bezier(0.4, 0, 1, 1)', // Ease-in for exits
  			'natural-out': 'cubic-bezier(0, 0, 0.2, 1)', // Ease-out for entrances
  			'natural': 'cubic-bezier(0.4, 0, 0.2, 1)', // Standard ease-in-out
  			'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Gentle spring
  			'gentle': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Gentle motion
  		},
  		fontSize: {
  			'xs': ['var(--font-size-xs)', { lineHeight: 'var(--line-height-normal)' }],
  			'sm': ['var(--font-size-sm)', { lineHeight: 'var(--line-height-normal)' }],
  			'base': ['var(--font-size-base)', { lineHeight: 'var(--line-height-normal)' }],
  			'lg': ['var(--font-size-lg)', { lineHeight: 'var(--line-height-normal)' }],
  			'xl': ['var(--font-size-xl)', { lineHeight: 'var(--line-height-snug)' }],
  			'2xl': ['var(--font-size-2xl)', { lineHeight: 'var(--line-height-tight)' }],
  			'3xl': ['var(--font-size-3xl)', { lineHeight: 'var(--line-height-tight)' }],
  			'4xl': ['var(--font-size-4xl)', { lineHeight: 'var(--line-height-tight)' }],
  			'5xl': ['var(--font-size-5xl)', { lineHeight: 'var(--line-height-tight)' }],
  		},
  		spacing: {
  			'px': 'var(--space-px)',
  			'0': 'var(--space-0)',
  			'1': 'var(--space-1)',
  			'2': 'var(--space-2)',
  			'3': 'var(--space-3)',
  			'4': 'var(--space-4)',
  			'5': 'var(--space-5)',
  			'6': 'var(--space-6)',
  			'8': 'var(--space-8)',
  			'10': 'var(--space-10)',
  			'12': 'var(--space-12)',
  			'16': 'var(--space-16)',
  			'20': 'var(--space-20)',
  			'24': 'var(--space-24)',
  			'32': 'var(--space-32)',
  		},
  		boxShadow: {
  			'sm': 'var(--shadow-sm)',
  			'DEFAULT': 'var(--shadow)',
  			'md': 'var(--shadow-md)',
  			'lg': 'var(--shadow-lg)',
  			'xl': 'var(--shadow-xl)',
  		},
  		screens: {
  			'xs': '360px',
  			'sm': '640px',
  			'md': '768px',
  			'lg': '1024px',
  			'xl': '1280px',
  			'2xl': '1536px',
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
