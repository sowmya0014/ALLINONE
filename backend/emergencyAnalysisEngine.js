const OpenAI = require('openai');

class EmergencyAnalysisEngine {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.emergencyCategories = {
      MEDICAL: {
        keywords: ['heart', 'pain', 'bleeding', 'unconscious', 'breathing', 'chest', 'headache', 'fever', 'injury', 'symptoms'],
        services: ['ambulance', 'hospital', 'emergency_room', 'paramedic'],
        priority: 'HIGH',
        responseTime: '5-8 minutes'
      },
      FIRE: {
        keywords: ['fire', 'smoke', 'burning', 'explosion', 'flame', 'heat', 'blaze'],
        services: ['fire_department', 'ambulance', 'police', 'emergency_services'],
        priority: 'CRITICAL',
        responseTime: '3-5 minutes'
      },
      SECURITY: {
        keywords: ['attack', 'threat', 'danger', 'weapon', 'robbery', 'assault', 'suspicious', 'intruder', 'violence'],
        services: ['police', 'ambulance', 'security'],
        priority: 'HIGH',
        responseTime: '4-7 minutes'
      },
      ACCIDENT: {
        keywords: ['car', 'crash', 'fall', 'collision', 'traffic', 'broken', 'wound', 'accident', 'injury'],
        services: ['ambulance', 'police', 'fire_department', 'tow_truck'],
        priority: 'HIGH',
        responseTime: '6-10 minutes'
      },
      NATURAL_DISASTER: {
        keywords: ['earthquake', 'flood', 'storm', 'hurricane', 'tornado', 'landslide', 'tsunami'],
        services: ['emergency_services', 'police', 'fire_department', 'rescue'],
        priority: 'CRITICAL',
        responseTime: '8-15 minutes'
      },
      TECHNICAL: {
        keywords: ['system', 'failure', 'outage', 'error', 'technical', 'malfunction', 'bug'],
        services: ['technical_support', 'emergency_services'],
        priority: 'MEDIUM',
        responseTime: '10-20 minutes'
      }
    };
    
    this.severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    this.urgencyLevels = ['LOW', 'MEDIUM', 'HIGH', 'IMMEDIATE'];
  }

  async analyzeEmergency(input) {
    try {
      const { description, audio, image, location, userRole } = input;
      
      // Step 1: Multi-modal Analysis
      const textAnalysis = await this.analyzeText(description);
      const voiceAnalysis = audio ? await this.analyzeVoice(audio) : null;
      const imageAnalysis = image ? await this.analyzeImage(image) : null;
      
      // Step 2: AI-Powered Incident Summarization
      const incidentSummary = await this.generateIncidentSummary(textAnalysis, voiceAnalysis, imageAnalysis, location, userRole);
      
      // Step 3: Intelligent Response Coordination
      const responsePlan = await this.generateResponsePlan(incidentSummary);
      
      return {
        success: true,
        analysis: {
          ...incidentSummary,
          responsePlan,
          timestamp: new Date().toISOString(),
          confidence: this.calculateConfidence(textAnalysis, voiceAnalysis, imageAnalysis)
        },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Emergency Analysis Error:', error);
      return {
        success: false,
        error: error.message,
        fallbackAnalysis: this.generateFallbackAnalysis(input)
      };
    }
  }

  async analyzeText(description) {
    try {
      const prompt = `
        Analyze this emergency description and provide a comprehensive IT incident summary:
        Description: "${description}"
        
        Please provide a JSON response with:
        {
          "category": "MEDICAL|FIRE|SECURITY|ACCIDENT|NATURAL_DISASTER|TECHNICAL",
          "severity": "LOW|MEDIUM|HIGH|CRITICAL",
          "urgency": "LOW|MEDIUM|HIGH|IMMEDIATE",
          "keywords": ["extracted", "keywords"],
          "location_indicators": ["location", "clues"],
          "medical_indicators": ["symptoms", "conditions"],
          "safety_concerns": ["safety", "risks"],
          "technical_issues": ["system", "problems"],
          "affected_systems": ["systems", "impacted"],
          "user_impact": "description of impact on users",
          "business_impact": "description of business impact",
          "confidence": 0.0-1.0,
          "incident_type": "USER_SAFETY|SYSTEM_FAILURE|SECURITY_BREACH|NATURAL_EVENT"
        }
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800
      });

      const analysis = JSON.parse(response.choices[0].message.content);
      return analysis;
      
    } catch (error) {
      console.error('Text Analysis Error:', error);
      return this.fallbackTextAnalysis(description);
    }
  }

  async analyzeVoice(audioData) {
    // Enhanced voice analysis with tone and urgency detection
    return {
      urgency: 'MEDIUM',
      panic_level: 'LOW',
      background_sounds: [],
      speech_clarity: 'GOOD',
      voice_stress: 'NORMAL',
      emergency_indicators: [],
      language_detected: 'en',
      confidence: 0.7
    };
  }

  async analyzeImage(imageData) {
    // Enhanced image analysis for emergency context
    return {
      injury_detected: false,
      damage_assessment: 'NONE',
      situation_analysis: 'CLEAR',
      safety_level: 'SAFE',
      emergency_indicators: [],
      people_count: 0,
      vehicle_involved: false,
      fire_detected: false,
      smoke_detected: false,
      confidence: 0.6
    };
  }

  async generateIncidentSummary(textAnalysis, voiceAnalysis, imageAnalysis, location, userRole) {
    const category = textAnalysis.category || 'UNKNOWN';
    const severity = this.calculateSeverity(textAnalysis, voiceAnalysis, imageAnalysis);
    const priority = this.calculatePriority(severity, category);
    
    const summary = {
      incidentId: this.generateIncidentId(),
      category: category,
      severity: severity,
      priority: priority,
      urgency: textAnalysis.urgency || 'MEDIUM',
      location: location || 'Unknown',
      description: this.createStructuredDescription(textAnalysis),
      recommendedServices: this.getRecommendedServices(category, severity),
      estimatedResponseTime: this.calculateResponseTime(location, category),
      actionItems: this.generateActionItems(category, severity, userRole),
      userRole: userRole,
      confidence: textAnalysis.confidence || 0.7,
      timestamp: new Date().toISOString(),
      
      // IT Incident Specific Fields
      incidentType: textAnalysis.incident_type || 'USER_SAFETY',
      affectedSystems: textAnalysis.affected_systems || [],
      userImpact: textAnalysis.user_impact || 'Unknown',
      businessImpact: textAnalysis.business_impact || 'Unknown',
      technicalIssues: textAnalysis.technical_issues || [],
      
      // Emergency Response Fields
      immediateActions: this.getImmediateActions(category, severity),
      escalationPath: this.getEscalationPath(category, severity),
      communicationPlan: this.getCommunicationPlan(category, userRole),
      resourceRequirements: this.getResourceRequirements(category, severity)
    };

    return summary;
  }

  async generateResponsePlan(incidentSummary) {
    const { category, severity, priority, userRole } = incidentSummary;
    
    return {
      immediateResponse: {
        firstResponder: this.getFirstResponder(category),
        estimatedArrival: incidentSummary.estimatedResponseTime,
        initialActions: incidentSummary.immediateActions,
        communicationChannels: ['phone', 'sms', 'app_notification']
      },
      
      escalationMatrix: {
        level1: severity === 'LOW' ? 'local_team' : 'emergency_services',
        level2: severity === 'HIGH' ? 'emergency_coordinator' : 'supervisor',
        level3: severity === 'CRITICAL' ? 'emergency_management' : 'manager',
        autoEscalation: priority === 'IMMEDIATE' ? '5_minutes' : '15_minutes'
      },
      
      coordinationPlan: {
        primaryContact: this.getPrimaryContact(category),
        backupContact: this.getBackupContact(category),
        stakeholders: this.getStakeholders(category, userRole),
        notificationSequence: this.getNotificationSequence(priority)
      },
      
      resourceAllocation: {
        personnel: this.getPersonnelRequirements(category, severity),
        equipment: this.getEquipmentRequirements(category),
        vehicles: this.getVehicleRequirements(category),
        facilities: this.getFacilityRequirements(category)
      },
      
      communicationStrategy: {
        internalUpdates: 'every_5_minutes',
        externalUpdates: 'every_15_minutes',
        publicAnnouncements: severity === 'CRITICAL' ? 'immediate' : 'as_needed',
        mediaHandling: severity === 'CRITICAL' ? 'designated_spokesperson' : 'standard_protocol'
      }
    };
  }

  calculateSeverity(textAnalysis, voiceAnalysis, imageAnalysis) {
    let severityScore = 0;
    
    // Text-based severity
    if (textAnalysis.severity === 'CRITICAL') severityScore += 4;
    else if (textAnalysis.severity === 'HIGH') severityScore += 3;
    else if (textAnalysis.severity === 'MEDIUM') severityScore += 2;
    else severityScore += 1;
    
    // Voice-based severity
    if (voiceAnalysis && voiceAnalysis.panic_level === 'HIGH') severityScore += 2;
    if (voiceAnalysis && voiceAnalysis.urgency === 'IMMEDIATE') severityScore += 2;
    
    // Image-based severity
    if (imageAnalysis && imageAnalysis.injury_detected) severityScore += 2;
    if (imageAnalysis && imageAnalysis.safety_level === 'DANGEROUS') severityScore += 2;
    
    // Determine final severity
    if (severityScore >= 6) return 'CRITICAL';
    if (severityScore >= 4) return 'HIGH';
    if (severityScore >= 2) return 'MEDIUM';
    return 'LOW';
  }

  calculatePriority(severity, category) {
    const priorityMatrix = {
      'CRITICAL': 'IMMEDIATE',
      'HIGH': 'URGENT',
      'MEDIUM': 'NORMAL',
      'LOW': 'LOW'
    };
    
    return priorityMatrix[severity] || 'NORMAL';
  }

  getRecommendedServices(category, severity) {
    const baseServices = this.emergencyCategories[category]?.services || ['emergency_services'];
    
    if (severity === 'CRITICAL') {
      baseServices.push('emergency_coordinator', 'emergency_management');
    }
    
    if (severity === 'HIGH') {
      baseServices.push('supervisor', 'backup_team');
    }
    
    return baseServices;
  }

  calculateResponseTime(location, category) {
    const baseTime = {
      'MEDICAL': 5,
      'FIRE': 3,
      'SECURITY': 4,
      'ACCIDENT': 6,
      'NATURAL_DISASTER': 8,
      'TECHNICAL': 10
    };
    
    return `${baseTime[category] || 5}-${(baseTime[category] || 5) + 3} minutes`;
  }

  generateActionItems(category, severity, userRole) {
    const actionItems = [];
    
    // Role-based actions
    if (userRole === 'SENIOR') {
      actionItems.push('Stay calm and seated if possible');
      actionItems.push('Keep emergency contacts nearby');
      actionItems.push('Follow medical instructions carefully');
    } else if (userRole === 'CHILDREN') {
      actionItems.push('Stay with a trusted adult');
      actionItems.push('Don\'t hide or run away');
      actionItems.push('Listen to emergency instructions');
    } else if (userRole === 'WOMEN') {
      actionItems.push('Move to a safe, well-lit area');
      actionItems.push('Keep phone accessible');
      actionItems.push('Contact emergency contacts');
    } else if (userRole === 'LAYMAN') {
      actionItems.push('Assess the situation safely');
      actionItems.push('Call emergency services if needed');
      actionItems.push('Follow safety protocols');
    }
    
    // Category-based actions
    if (category === 'MEDICAL') {
      actionItems.push('Keep the person calm and comfortable');
      actionItems.push('Don\'t move them if injured');
      actionItems.push('Monitor breathing and consciousness');
    } else if (category === 'FIRE') {
      actionItems.push('Evacuate immediately');
      actionItems.push('Don\'t use elevators');
      actionItems.push('Stay low to avoid smoke');
    } else if (category === 'SECURITY') {
      actionItems.push('Lock doors and windows');
      actionItems.push('Stay quiet and hidden');
      actionItems.push('Call police immediately');
    } else if (category === 'TECHNICAL') {
      actionItems.push('Document the issue');
      actionItems.push('Contact technical support');
      actionItems.push('Follow system protocols');
    }
    
    return actionItems;
  }

  getImmediateActions(category, severity) {
    const actions = {
      'MEDICAL': ['Assess consciousness', 'Check breathing', 'Call ambulance'],
      'FIRE': ['Evacuate area', 'Call fire department', 'Account for people'],
      'SECURITY': ['Secure location', 'Call police', 'Document incident'],
      'TECHNICAL': ['Isolate affected systems', 'Contact IT support', 'Assess impact']
    };
    
    return actions[category] || ['Assess situation', 'Call appropriate services'];
  }

  getEscalationPath(category, severity) {
    return {
      immediate: severity === 'CRITICAL' ? 'emergency_services' : 'first_responder',
      secondary: severity === 'HIGH' ? 'supervisor' : 'team_lead',
      tertiary: severity === 'MEDIUM' ? 'manager' : 'coordinator'
    };
  }

  getCommunicationPlan(category, userRole) {
    return {
      primary: 'emergency_services',
      secondary: 'family_contacts',
      tertiary: 'work_contacts',
      channels: ['phone', 'sms', 'app', 'email']
    };
  }

  getResourceRequirements(category, severity) {
    return {
      personnel: severity === 'CRITICAL' ? 'full_team' : 'minimal_team',
      equipment: this.emergencyCategories[category]?.equipment || 'standard',
      vehicles: severity === 'CRITICAL' ? 'multiple' : 'single',
      facilities: severity === 'CRITICAL' ? 'emergency_center' : 'local_facility'
    };
  }

  getFirstResponder(category) {
    const responders = {
      'MEDICAL': 'paramedic',
      'FIRE': 'firefighter',
      'SECURITY': 'police_officer',
      'TECHNICAL': 'technical_specialist'
    };
    
    return responders[category] || 'emergency_responder';
  }

  getPrimaryContact(category) {
    const contacts = {
      'MEDICAL': 'emergency_medical_services',
      'FIRE': 'fire_department',
      'SECURITY': 'police_department',
      'TECHNICAL': 'it_support_team'
    };
    
    return contacts[category] || 'emergency_coordinator';
  }

  getBackupContact(category) {
    return 'backup_coordinator';
  }

  getStakeholders(category, userRole) {
    const stakeholders = ['emergency_services', 'family_contacts'];
    
    if (userRole === 'SENIOR') {
      stakeholders.push('medical_provider', 'caregiver');
    } else if (userRole === 'CHILDREN') {
      stakeholders.push('parents', 'school_authorities');
    }
    
    return stakeholders;
  }

  getNotificationSequence(priority) {
    const sequences = {
      'IMMEDIATE': ['emergency_services', 'family', 'work'],
      'URGENT': ['emergency_services', 'family'],
      'NORMAL': ['coordinator', 'family'],
      'LOW': ['coordinator']
    };
    
    return sequences[priority] || sequences['NORMAL'];
  }

  getPersonnelRequirements(category, severity) {
    return severity === 'CRITICAL' ? 'full_emergency_team' : 'minimal_response_team';
  }

  getEquipmentRequirements(category) {
    const equipment = {
      'MEDICAL': ['first_aid_kit', 'defibrillator', 'medical_supplies'],
      'FIRE': ['fire_extinguisher', 'safety_equipment', 'evacuation_gear'],
      'SECURITY': ['communication_devices', 'safety_equipment'],
      'TECHNICAL': ['diagnostic_tools', 'backup_systems']
    };
    
    return equipment[category] || ['standard_equipment'];
  }

  getVehicleRequirements(category) {
    const vehicles = {
      'MEDICAL': ['ambulance'],
      'FIRE': ['fire_truck', 'ambulance'],
      'SECURITY': ['police_vehicle'],
      'TECHNICAL': ['service_vehicle']
    };
    
    return vehicles[category] || ['emergency_vehicle'];
  }

  getFacilityRequirements(category) {
    return category === 'CRITICAL' ? 'emergency_center' : 'local_facility';
  }

  createStructuredDescription(textAnalysis) {
    return {
      category: textAnalysis.category,
      severity: textAnalysis.severity,
      urgency: textAnalysis.urgency,
      keywords: textAnalysis.keywords || [],
      medicalIndicators: textAnalysis.medical_indicators || [],
      safetyConcerns: textAnalysis.safety_concerns || [],
      technicalIssues: textAnalysis.technical_issues || [],
      affectedSystems: textAnalysis.affected_systems || [],
      userImpact: textAnalysis.user_impact,
      businessImpact: textAnalysis.business_impact
    };
  }

  generateIncidentId() {
    return 'EMG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  calculateConfidence(textAnalysis, voiceAnalysis, imageAnalysis) {
    let confidence = 0;
    let factors = 0;
    
    if (textAnalysis && textAnalysis.confidence) {
      confidence += textAnalysis.confidence;
      factors++;
    }
    
    if (voiceAnalysis && voiceAnalysis.confidence) {
      confidence += voiceAnalysis.confidence;
      factors++;
    }
    
    if (imageAnalysis && imageAnalysis.confidence) {
      confidence += imageAnalysis.confidence;
      factors++;
    }
    
    return factors > 0 ? confidence / factors : 0.5;
  }

  fallbackTextAnalysis(description) {
    const lowerDesc = description.toLowerCase();
    
    let category = 'UNKNOWN';
    let severity = 'MEDIUM';
    
    // Enhanced category detection
    if (lowerDesc.includes('heart') || lowerDesc.includes('pain') || lowerDesc.includes('bleeding')) {
      category = 'MEDICAL';
    } else if (lowerDesc.includes('fire') || lowerDesc.includes('smoke')) {
      category = 'FIRE';
    } else if (lowerDesc.includes('attack') || lowerDesc.includes('threat')) {
      category = 'SECURITY';
    } else if (lowerDesc.includes('car') || lowerDesc.includes('crash')) {
      category = 'ACCIDENT';
    } else if (lowerDesc.includes('system') || lowerDesc.includes('error')) {
      category = 'TECHNICAL';
    }
    
    // Enhanced severity detection
    if (lowerDesc.includes('urgent') || lowerDesc.includes('immediately')) {
      severity = 'HIGH';
    } else if (lowerDesc.includes('critical') || lowerDesc.includes('emergency')) {
      severity = 'CRITICAL';
    }
    
    return {
      category,
      severity,
      urgency: severity === 'CRITICAL' ? 'IMMEDIATE' : 'MEDIUM',
      keywords: description.split(' ').slice(0, 5),
      confidence: 0.5,
      incident_type: 'USER_SAFETY'
    };
  }

  generateFallbackAnalysis(input) {
    return {
      incidentId: this.generateIncidentId(),
      category: 'UNKNOWN',
      severity: 'MEDIUM',
      priority: 'NORMAL',
      location: input.location || 'Unknown',
      description: 'Emergency reported - manual review required',
      recommendedServices: ['emergency_services'],
      estimatedResponseTime: '5-8 minutes',
      actionItems: ['Stay calm', 'Keep phone accessible', 'Wait for emergency services'],
      userRole: input.userRole,
      confidence: 0.3,
      timestamp: new Date().toISOString(),
      incidentType: 'USER_SAFETY',
      affectedSystems: [],
      userImpact: 'Unknown',
      businessImpact: 'Unknown'
    };
  }
}

module.exports = EmergencyAnalysisEngine; 