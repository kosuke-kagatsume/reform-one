#!/usr/bin/env ts-node

import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'js-yaml'
import { openApiSpec } from '../src/openapi'

// Convert to YAML
const yamlStr = yaml.dump(openApiSpec, {
  skipInvalid: true,
  noRefs: true,
})

// Write YAML file
const outputPath = path.join(__dirname, '..', 'openapi.yaml')
fs.writeFileSync(outputPath, yamlStr)

// Also write JSON version
const jsonPath = path.join(__dirname, '..', 'openapi.json')
fs.writeFileSync(jsonPath, JSON.stringify(openApiSpec, null, 2))

console.log('✅ OpenAPI specification generated:')
console.log(`   - YAML: ${outputPath}`)
console.log(`   - JSON: ${jsonPath}`)