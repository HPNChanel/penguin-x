#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Bundle size limits (in bytes)
const LIMITS = {
  // Main bundle should be under 500KB
  main: 500 * 1024,
  // Vendor chunks should be under 800KB total
  vendor: 800 * 1024,
  // Individual chunks should be under 200KB
  chunk: 200 * 1024,
  // CSS should be under 100KB
  css: 100 * 1024
}

function getFileSizeInBytes(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return stats.size
  } catch (error) {
    return 0
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function analyzeBundleSize() {
  const distPath = path.join(__dirname, '../dist')
  const assetsPath = path.join(distPath, 'assets')
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist folder not found. Run "npm run build" first.')
    process.exit(1)
  }

  if (!fs.existsSync(assetsPath)) {
    console.error('❌ Assets folder not found in dist.')
    process.exit(1)
  }

  const files = fs.readdirSync(assetsPath)
  const results = {
    js: [],
    css: [],
    other: []
  }

  let totalSize = 0
  let hasErrors = false

  console.log('📦 Bundle Size Analysis\n')

  files.forEach(file => {
    const filePath = path.join(assetsPath, file)
    const size = getFileSizeInBytes(filePath)
    totalSize += size

    const fileInfo = { name: file, size }

    if (file.endsWith('.js')) {
      results.js.push(fileInfo)
    } else if (file.endsWith('.css')) {
      results.css.push(fileInfo)
    } else {
      results.other.push(fileInfo)
    }
  })

  // Analyze JavaScript bundles
  console.log('📄 JavaScript Bundles:')
  let vendorSize = 0
  let mainSize = 0

  results.js.forEach(({ name, size }) => {
    const status = size > LIMITS.chunk ? '❌' : '✅'
    const percentage = ((size / LIMITS.chunk) * 100).toFixed(1)
    
    console.log(`  ${status} ${name}: ${formatBytes(size)} (${percentage}% of limit)`)
    
    if (size > LIMITS.chunk) {
      hasErrors = true
    }

    // Categorize bundles
    if (name.includes('vendor') || name.includes('react') || name.includes('ui')) {
      vendorSize += size
    } else if (name.includes('index') || name.includes('main')) {
      mainSize += size
    }
  })

  // Check main bundle size
  if (mainSize > 0) {
    const mainStatus = mainSize > LIMITS.main ? '❌' : '✅'
    const mainPercentage = ((mainSize / LIMITS.main) * 100).toFixed(1)
    console.log(`\n📊 Main Bundle Total: ${formatBytes(mainSize)} (${mainPercentage}% of limit) ${mainStatus}`)
    
    if (mainSize > LIMITS.main) {
      hasErrors = true
    }
  }

  // Check vendor bundle size
  if (vendorSize > 0) {
    const vendorStatus = vendorSize > LIMITS.vendor ? '❌' : '✅'
    const vendorPercentage = ((vendorSize / LIMITS.vendor) * 100).toFixed(1)
    console.log(`📦 Vendor Bundles Total: ${formatBytes(vendorSize)} (${vendorPercentage}% of limit) ${vendorStatus}`)
    
    if (vendorSize > LIMITS.vendor) {
      hasErrors = true
    }
  }

  // Analyze CSS bundles
  if (results.css.length > 0) {
    console.log('\n🎨 CSS Bundles:')
    let totalCssSize = 0

    results.css.forEach(({ name, size }) => {
      const status = size > LIMITS.css ? '❌' : '✅'
      const percentage = ((size / LIMITS.css) * 100).toFixed(1)
      
      console.log(`  ${status} ${name}: ${formatBytes(size)} (${percentage}% of limit)`)
      totalCssSize += size
      
      if (size > LIMITS.css) {
        hasErrors = true
      }
    })

    const cssStatus = totalCssSize > LIMITS.css ? '❌' : '✅'
    console.log(`\n📊 Total CSS: ${formatBytes(totalCssSize)} ${cssStatus}`)
  }

  // Other assets
  if (results.other.length > 0) {
    console.log('\n📎 Other Assets:')
    results.other.forEach(({ name, size }) => {
      console.log(`  ℹ️  ${name}: ${formatBytes(size)}`)
    })
  }

  // Summary
  console.log(`\n📊 Total Bundle Size: ${formatBytes(totalSize)}`)

  // Recommendations
  if (hasErrors) {
    console.log('\n💡 Recommendations:')
    console.log('  • Consider code splitting for large bundles')
    console.log('  • Use dynamic imports for non-critical features')
    console.log('  • Analyze bundle composition with tools like webpack-bundle-analyzer')
    console.log('  • Remove unused dependencies and code')
    console.log('  • Optimize images and assets')
  }

  // Save results for CI
  const resultsPath = path.join(__dirname, '../bundle-size-results.json')
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalSize,
    limits: LIMITS,
    bundles: results,
    hasErrors,
    mainSize,
    vendorSize
  }, null, 2))

  console.log(`\n📄 Results saved to: ${resultsPath}`)

  if (hasErrors) {
    console.log('\n❌ Bundle size check failed! Some bundles exceed the size limits.')
    process.exit(1)
  } else {
    console.log('\n✅ Bundle size check passed! All bundles are within limits.')
    process.exit(0)
  }
}

analyzeBundleSize()
