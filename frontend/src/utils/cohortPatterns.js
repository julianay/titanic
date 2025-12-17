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

  // Must have at least sex or pclass to be valid
  if (sex === null && pclass === null) {
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
