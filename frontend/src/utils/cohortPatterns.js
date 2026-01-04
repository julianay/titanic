/**
 * Cohort Matching Patterns for Chat System
 * Ported from Python src/chat/cohort_patterns.py
 */

export const COHORT_PATTERNS = {
  first_class_child: {
    priority: 3, // Highest priority (most specific)
    match_criteria: {
      pclass: 1,
      age_range: [0, 12]
    },
    response: "First class children had the best odds. Children, especially in 1st and 2nd class, had high survival rates."
  },
  third_class_male: {
    priority: 2,
    match_criteria: {
      sex: 1,
      pclass: 3
    },
    response: "Third class males had the worst odds (24% survival rate). They were located furthest from lifeboats and had limited access to the deck."
  },
  women: {
    priority: 1,
    match_criteria: {
      sex: 0
    },
    response: "Women had a 74% survival rate. The 'women and children first' protocol was largely followed."
  },
  men: {
    priority: 1,
    match_criteria: {
      sex: 1
    },
    response: "Men had only a 19% survival rate (109 survived out of 577)."
  },
  first_class: {
    priority: 2,
    match_criteria: {
      pclass: 1
    },
    response: "First class passengers had a 63% survival rate (136 survived out of 216). Wealth and proximity to lifeboats mattered."
  },
  third_class: {
    priority: 2,
    match_criteria: {
      pclass: 3
    },
    response: "Third class passengers had the worst odds (119 survived out of 491, 24% survival rate). They were located furthest from lifeboats."
  }
}

/**
 * Match passenger parameters to the best cohort pattern
 */
export function matchToCohort(sex, pclass, age, fare) {
  // Sort cohorts by priority (highest first)
  const sortedCohorts = Object.entries(COHORT_PATTERNS).sort(
    (a, b) => b[1].priority - a[1].priority
  )

  for (const [cohortName, cohortInfo] of sortedCohorts) {
    const criteria = cohortInfo.match_criteria

    // Check sex if specified
    if ('sex' in criteria && criteria.sex !== sex) {
      continue
    }

    // Check pclass if specified
    if ('pclass' in criteria && criteria.pclass !== pclass) {
      continue
    }

    // Check age range if specified
    if ('age_range' in criteria) {
      const [minAge, maxAge] = criteria.age_range
      if (age < minAge || age > maxAge) {
        continue
      }
    }

    // All criteria matched!
    return { cohortName, cohortInfo }
  }

  // No match found, return generic fallback
  return {
    cohortName: null,
    cohortInfo: {
      response: "Here's the analysis for this passenger profile."
    }
  }
}

/**
 * Format passenger parameters into human-readable description
 */
export function formatPassengerDescription(sex, pclass, age, fare) {
  const sexLabel = sex === 0 ? 'female' : 'male'
  const classLabels = { 1: '1st class', 2: '2nd class', 3: '3rd class' }
  const classLabel = classLabels[pclass]

  return `${age}-year-old ${sexLabel} in ${classLabel}, £${fare} fare`
}

/**
 * Generate a short label for a cohort based on its parameters
 * Used for comparison cards
 *
 * @param {Object} params - Parsed passenger parameters
 * @returns {string} Short label like "1st class women" or "3rd class men (age 8)"
 */
export function generateCohortLabel(params) {
  const { sex, pclass, age, fare } = params

  // Determine primary identifiers
  const sexLabel = sex === 0 ? 'women' : 'men'
  const classLabels = { 1: '1st class', 2: '2nd class', 3: '3rd class' }
  const classLabel = classLabels[pclass]

  // Age category
  let ageNote = ''
  if (age <= 12) {
    ageNote = ' (children)'
  } else if (age >= 60) {
    ageNote = ' (elderly)'
  } else if (age <= 25) {
    ageNote = ' (young)'
  }

  // Fare category (if notably different from class average)
  const classAverageFares = { 1: 84, 2: 20, 3: 13 }
  const avgFare = classAverageFares[pclass]
  const fareRatio = fare / avgFare
  let fareNote = ''
  if (fareRatio > 1.5) {
    fareNote = ' (high fare)'
  } else if (fareRatio < 0.5) {
    fareNote = ' (low fare)'
  }

  // Build label: "class sex ageNote fareNote"
  return `${classLabel} ${sexLabel}${ageNote}${fareNote}`.trim()
}

/**
 * Detect if query is asking for a comparison between two cohorts
 * Now supports dynamic parsing: "1st class women vs 3rd class men"
 * Returns: { isComparison: true, cohortA: {...}, cohortB: {...} } or { isComparison: false }
 */
export function detectComparison(queryText) {
  const queryLower = queryText.toLowerCase()

  // Check for comparison keywords
  if (!/\b(compar|vs|versus|against|between|difference|\band\b|\bor\b)\b/.test(queryLower)) {
    return { isComparison: false }
  }

  // Try dynamic parsing first
  // Split on comparison keywords: vs, versus, against, and, or
  const splitRegex = /\b(vs\.?|versus|against|\band\b|\bor\b)\b/i
  const match = queryText.match(splitRegex)

  if (match) {
    const parts = queryText.split(splitRegex)

    if (parts.length >= 2) {
      // Extract the two cohort descriptions (parts[0] and parts[2], skipping the keyword in parts[1])
      let leftText = parts[0].trim()
      let rightText = parts.slice(2).join(' ').trim() // In case there are multiple split parts

      // Remove common prefixes like "compare", "show me", etc.
      leftText = leftText.replace(/^(compare|show me|what about|between)\s+/i, '').trim()
      rightText = rightText.replace(/^(and|to)\s+/i, '').trim()

      // Parse both sides
      const cohortA = parsePassengerQuery(leftText)
      const cohortB = parsePassengerQuery(rightText)

      // If both parsed successfully, use dynamic comparison
      if (cohortA && cohortB) {
        return {
          isComparison: true,
          cohortA: cohortA,
          cohortB: cohortB,
          labelA: generateCohortLabel(cohortA),
          labelB: generateCohortLabel(cohortB),
          description: `Comparing ${generateCohortLabel(cohortA)} vs ${generateCohortLabel(cohortB)}`
        }
      }
    }
  }

  // Fall back to hardcoded patterns for common queries that might not parse well
  // These are kept for backwards compatibility and clearer labeling

  // Women vs Men (simple, no other qualifiers)
  if (/\bwom[ae]n\s+(vs\.?|versus|against|and|or)\s+m[ae]n\b/i.test(queryLower) ||
      /\bm[ae]n\s+(vs\.?|versus|against|and|or)\s+wom[ae]n\b/i.test(queryLower)) {
    return {
      isComparison: true,
      cohortA: { sex: 0, pclass: 2, age: 30, fare: 20 },
      cohortB: { sex: 1, pclass: 2, age: 30, fare: 20 },
      labelA: "Women",
      labelB: "Men",
      description: "Comparing women vs men (2nd class, age 30)"
    }
  }

  // Children vs Adults (includes kids vs elderly)
  if (/\b(child(ren)?|kids?)\s+(vs\.?|versus|against|and|or)\s+(adults?|elderly|seniors?)\b/i.test(queryLower) ||
      /\b(adults?|elderly|seniors?)\s+(vs\.?|versus|against|and|or)\s+(child(ren)?|kids?)\b/i.test(queryLower)) {
    // Determine if comparing to elderly specifically
    const isElderlyComparison = /elderly|seniors?/i.test(queryLower)

    return {
      isComparison: true,
      cohortA: { sex: 0, pclass: 2, age: 8, fare: 20 },
      cohortB: { sex: 0, pclass: 2, age: isElderlyComparison ? 65 : 35, fare: 20 },
      labelA: /kids?/i.test(queryLower) ? "Kids" : "Children",
      labelB: isElderlyComparison ? "Elderly" : "Adults",
      description: `Comparing ${/kids?/i.test(queryLower) ? "kids" : "children"} (age 8) vs ${isElderlyComparison ? "elderly (age 65)" : "adults (age 35)"}`
    }
  }

  // 1st class vs 3rd class (simple)
  if (/\b(1st|first)\s+class\s+(vs\.?|versus|against|and|or)\s+(3rd|third)\s+class\b/i.test(queryLower) ||
      /\b(3rd|third)\s+class\s+(vs\.?|versus|against|and|or)\s+(1st|first)\s+class\b/i.test(queryLower)) {
    return {
      isComparison: true,
      cohortA: { sex: 0, pclass: 1, age: 30, fare: 84 },
      cohortB: { sex: 0, pclass: 3, age: 30, fare: 13 },
      labelA: "1st Class",
      labelB: "3rd Class",
      description: "Comparing 1st class vs 3rd class (female, age 30)"
    }
  }

  // No comparison pattern matched
  return { isComparison: false }
}

/**
 * Parse natural language query into passenger parameters
 */
export function parsePassengerQuery(queryText) {
  const queryLower = queryText.toLowerCase()

  // Parse sex
  let sex = null
  if (/woman|women|female|lady|ladies|girl/.test(queryLower)) {
    sex = 0
  } else if (/man|men|male|gentleman|boy/.test(queryLower)) {
    sex = 1
  }

  // Parse class
  let pclass = null
  if (/1st class|first class|upper class|wealthy|rich/.test(queryLower)) {
    pclass = 1
  } else if (/2nd class|second class|middle class/.test(queryLower)) {
    pclass = 2
  } else if (/3rd class|third class|lower class|poor|cheap/.test(queryLower)) {
    pclass = 3
  }

  // Parse age (approximate)
  let age = null
  if (/child|children|kid|young|baby|infant/.test(queryLower)) {
    age = 8 // Young child
  } else if (/elderly|senior|older|old/.test(queryLower)) {
    age = 65 // Senior
  } else if (/adult|middle-aged|middle aged/.test(queryLower)) {
    age = 35 // Middle-aged adult
  } else {
    // Try to extract numeric age
    const ageMatch = queryLower.match(/\b(\d+)[\s-]*(year|yr|y\.o\.|old)?\b/)
    if (ageMatch) {
      age = parseInt(ageMatch[1])
    }
  }

  // Default age if not specified
  if (age === null) {
    age = 30 // Default adult age
  }

  // Set fare based on class (historical averages)
  let fare = null
  if (pclass === 1) {
    fare = 84
  } else if (pclass === 2) {
    fare = 20
  } else if (pclass === 3) {
    fare = 13
  }

  // Must have at least one identifier to be valid (sex, pclass, or age)
  // Age alone is valid for queries like "kids" or "elderly"
  const hasAgeIdentifier = age !== null && (age <= 12 || age >= 60)
  if (sex === null && pclass === null && !hasAgeIdentifier) {
    return null
  }

  // Fill in defaults for missing values
  if (sex === null) {
    sex = 0 // Default to female
  }
  if (pclass === null) {
    pclass = 2 // Default to 2nd class
  }
  if (fare === null) {
    fare = 20 // Default to 2nd class fare
  }

  return { sex, pclass, age, fare }
}
