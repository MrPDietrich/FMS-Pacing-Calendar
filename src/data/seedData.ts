import type { CalendarCategory, NgssModel, StandardType } from '../types/pacing';

export interface SeedCalendar {
  id: string;
  name: string;
  category: CalendarCategory;
  isScience: boolean;
  order: number;
}

export interface SeedStandard {
  id: string;
  calendarId: string;
  code: string;
  description: string;
  gradeLevel: string;
  domain: string;
  type: StandardType;
  ngssModel: NgssModel;
}

export const SEED_CALENDARS: SeedCalendar[] = [
  // 6th Grade Core
  { id: '6th-grade-math', name: '6th Grade Math', category: '6th Grade Core', isScience: false, order: 1 },
  { id: '6th-grade-science', name: '6th Grade Science', category: '6th Grade Core', isScience: true, order: 2 },
  { id: '6th-grade-social-studies', name: '6th Grade Social Studies', category: '6th Grade Core', isScience: false, order: 3 },
  { id: '6th-grade-language-arts', name: '6th Grade Language Arts', category: '6th Grade Core', isScience: false, order: 4 },

  // 7th Grade Core
  { id: '7th-grade-math', name: '7th Grade Math', category: '7th Grade Core', isScience: false, order: 5 },
  { id: '7th-grade-science', name: '7th Grade Science', category: '7th Grade Core', isScience: true, order: 6 },
  { id: '7th-grade-social-studies', name: '7th Grade Social Studies', category: '7th Grade Core', isScience: false, order: 7 },
  { id: '7th-grade-ela', name: '7th Grade ELA', category: '7th Grade Core', isScience: false, order: 8 },

  // 8th Grade Core
  { id: '8th-grade-math', name: '8th Grade Math', category: '8th Grade Core', isScience: false, order: 9 },
  { id: '8th-grade-science', name: '8th Grade Science', category: '8th Grade Core', isScience: true, order: 10 },
  { id: '8th-grade-social-studies', name: '8th Grade Social Studies', category: '8th Grade Core', isScience: false, order: 11 },
  { id: '8th-grade-ela', name: '8th Grade ELA', category: '8th Grade Core', isScience: false, order: 12 },

  // VAPA
  { id: 'vapa-art', name: 'VAPA Art', category: 'VAPA', isScience: false, order: 13 },
  { id: 'vapa-cte', name: 'VAPA CTE', category: 'VAPA', isScience: false, order: 14 },
  { id: 'vapa-band', name: 'VAPA Band', category: 'VAPA', isScience: false, order: 15 },
  { id: 'vapa-fms-spanish', name: 'VAPA FMS Spanish', category: 'VAPA', isScience: false, order: 16 },
  { id: 'vapa-fms-spanish-1', name: 'VAPA FMS Spanish 1', category: 'VAPA', isScience: false, order: 17 },

  // PE
  { id: '6th-grade-pe', name: '6th Grade PE', category: 'PE', isScience: false, order: 18 },
  { id: '7th-grade-pe', name: '7th Grade PE', category: 'PE', isScience: false, order: 19 },
  { id: '8th-grade-pe', name: '8th Grade PE', category: 'PE', isScience: false, order: 20 },

  // SDC
  { id: '6-8-sdc-ela-social-studies', name: '6-8th Grade SDC ELA/Social Studies', category: 'SDC', isScience: false, order: 21 },
  { id: '6-8-sdc-math-science', name: '6-8th Grade SDC Math/Science', category: 'SDC', isScience: true, order: 22 },
];

function s(
  calendarId: string,
  idx: number,
  code: string,
  description: string,
  gradeLevel: string,
  domain: string,
  type: StandardType,
  ngssModel: NgssModel = 'none'
): SeedStandard {
  return {
    id: `${calendarId}__seed_${idx}`,
    calendarId,
    code,
    description,
    gradeLevel,
    domain,
    type,
    ngssModel,
  };
}

export const SEED_STANDARDS: SeedStandard[] = [
  // 6th Grade Math
  s('6th-grade-math', 1, '6.RP.A.1', 'Understand the concept of a ratio and use ratio language to describe a ratio relationship between two quantities.', '6', 'Ratios & Proportional Relationships', 'essential'),
  s('6th-grade-math', 2, '6.NS.A.1', 'Interpret and compute quotients of fractions, and solve word problems involving division of fractions by fractions.', '6', 'The Number System', 'essential'),
  s('6th-grade-math', 3, '6.EE.A.2', 'Write, read, and evaluate expressions in which letters stand for numbers.', '6', 'Expressions & Equations', 'supporting'),
  s('6th-grade-math', 4, '6.G.A.1', 'Find the area of right triangles, other triangles, special quadrilaterals, and polygons by composing into rectangles or decomposing into triangles.', '6', 'Geometry', 'unassigned'),
  s('6th-grade-math', 5, '5.NF.B.4', 'Apply and extend previous understandings of multiplication to multiply a fraction or whole number by a fraction.', '5', 'Number & Operations—Fractions', 'prerequisite'),

  // 6th Grade Science (CA NGSS Integrated + Discipline-Specific)
  s('6th-grade-science', 1, 'MS-LS1-1', 'Conduct an investigation to provide evidence that living things are made of cells; either one cell or many different numbers and types of cells.', '6', 'Life Science', 'essential', 'integrated'),
  s('6th-grade-science', 2, 'MS-ESS2-4', 'Develop a model to describe the cycling of water through Earth’s systems driven by energy from the sun and the force of gravity.', '6', 'Earth & Space Science', 'essential', 'both'),
  s('6th-grade-science', 3, 'MS-PS3-3', 'Apply scientific principles to design, construct, and test a device that either minimizes or maximizes thermal energy transfer.', '6', 'Physical Science', 'supporting', 'integrated'),
  s('6th-grade-science', 4, 'MS-ESS2-5', 'Collect data to provide evidence for how the motions and complex interactions of air masses result in changes in weather conditions.', '6', 'Earth & Space Science', 'supporting', 'discipline-specific'),
  s('6th-grade-science', 5, '5-ESS2-1', 'Develop a model using an example to describe ways the geosphere, biosphere, hydrosphere, and/or atmosphere interact.', '5', 'Earth Systems', 'prerequisite', 'both'),

  // 6th Grade Social Studies
  s('6th-grade-social-studies', 1, 'HSS 6.2.1', 'Locate and describe the major river systems and discuss the physical settings that supported permanent settlement and early civilizations.', '6', 'Early Civilizations', 'essential'),
  s('6th-grade-social-studies', 2, 'HSS 6.2.3', 'Understand the relationship between religion and the social and political order in Mesopotamia and Egypt.', '6', 'Early Civilizations', 'supporting'),
  s('6th-grade-social-studies', 3, 'HSS 6.4.3', 'State the key differences between Athenian, or direct, democracy and representative democracy.', '6', 'Ancient Greece', 'essential'),
  s('6th-grade-social-studies', 4, 'HSS 6.7.1', 'Identify the location and describe the rise of the Roman Republic, including the importance of such mythical and historical figures as Aeneas, Romulus and Remus, Cincinnatus, Julius Caesar, and Cicero.', '6', 'Ancient Rome', 'unassigned'),
  s('6th-grade-social-studies', 5, 'HSS 5.1.1', 'Describe how geography and climate influenced the way various nations lived and adjusted to the natural environment.', '5', 'Geographic Foundations', 'prerequisite'),

  // 6th Grade Language Arts
  s('6th-grade-language-arts', 1, 'RL.6.1', 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', '6', 'Reading Literature', 'essential'),
  s('6th-grade-language-arts', 2, 'RI.6.2', 'Determine a central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments.', '6', 'Reading Informational Text', 'essential'),
  s('6th-grade-language-arts', 3, 'W.6.1', 'Write arguments to support claims with clear reasons and relevant evidence.', '6', 'Writing', 'supporting'),
  s('6th-grade-language-arts', 4, 'SL.6.1', 'Engage effectively in a range of collaborative discussions with diverse partners on grade 6 topics, texts, and issues.', '6', 'Speaking & Listening', 'unassigned'),
  s('6th-grade-language-arts', 5, 'RL.5.1', 'Quote accurately from a text when explaining what the text says explicitly and when drawing inferences from the text.', '5', 'Reading Literature', 'prerequisite'),

  // 7th Grade Math
  s('7th-grade-math', 1, '7.NS.A.1', 'Apply and extend previous understandings of addition and subtraction to add and subtract rational numbers; represent addition and subtraction on a horizontal or vertical number line diagram.', '7', 'The Number System', 'essential'),
  s('7th-grade-math', 2, '7.RP.A.2', 'Recognize and represent proportional relationships between quantities using tables, graphs, and equations.', '7', 'Ratios & Proportional Relationships', 'essential'),
  s('7th-grade-math', 3, '7.EE.B.4', 'Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems.', '7', 'Expressions & Equations', 'supporting'),
  s('7th-grade-math', 4, '7.SP.A.1', 'Understand that statistics can be used to gain information about a population by examining a sample of the population.', '7', 'Statistics & Probability', 'unassigned'),
  s('7th-grade-math', 5, '6.NS.C.6', 'Understand a rational number as a point on the number line and extend number line diagrams to represent points with negative number coordinates.', '6', 'The Number System', 'prerequisite'),

  // 7th Grade Science
  s('7th-grade-science', 1, 'MS-PS1-1', 'Develop models to describe the atomic composition of simple molecules and extended structures.', '7', 'Physical Science', 'essential', 'integrated'),
  s('7th-grade-science', 2, 'MS-LS2-1', 'Analyze and interpret data to provide evidence for the effects of resource availability on organisms and populations of organisms in an ecosystem.', '7', 'Life Science', 'essential', 'both'),
  s('7th-grade-science', 3, 'MS-LS1-6', 'Construct a scientific explanation based on evidence for the role of photosynthesis in the cycling of matter and flow of energy into and out of organisms.', '7', 'Life Science', 'supporting', 'discipline-specific'),
  s('7th-grade-science', 4, 'MS-ESS2-2', 'Construct an explanation based on evidence for how geoscience processes have changed Earth’s surface at varying time and spatial scales.', '7', 'Earth & Space Science', 'supporting', 'integrated'),
  s('7th-grade-science', 5, 'MS-LS1-2', 'Develop and use a model to describe the function of a cell as a whole and ways the parts of cells contribute to the function.', '6', 'Life Science', 'prerequisite', 'both'),

  // 7th Grade Social Studies
  s('7th-grade-social-studies', 1, 'HSS 7.2.4', 'Discuss the expansion of Muslim rule through military conquests and treaties, emphasizing the cultural blending within Muslim civilization.', '7', 'Medieval World History', 'essential'),
  s('7th-grade-social-studies', 2, 'HSS 7.6.3', 'Understand the development of feudalism, its role in the medieval European economy, and the way in which it was influenced by physical geography.', '7', 'Medieval Europe', 'essential'),
  s('7th-grade-social-studies', 3, 'HSS 7.8.1', 'Describe the way in which the revival of classical learning and the arts fostered a new interest in humanism during the Renaissance.', '7', 'The Renaissance', 'supporting'),
  s('7th-grade-social-studies', 4, 'HSS 7.11.2', 'Discuss the exchanges of plants, animals, technology, culture, and ideas among Europe, Africa, Asia, and the Americas in the fifteenth and sixteenth centuries.', '7', 'Age of Exploration', 'unassigned'),
  s('7th-grade-social-studies', 5, 'HSS 6.7.8', 'Discuss the legacies of Roman art and architecture, technology and science, literature, language, and law.', '6', 'Ancient Rome', 'prerequisite'),

  // 7th Grade ELA
  s('7th-grade-ela', 1, 'RL.7.1', 'Cite several pieces of textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.', '7', 'Reading Literature', 'essential'),
  s('7th-grade-ela', 2, 'RI.7.8', 'Trace and evaluate the argument and specific claims in a text, assessing whether the reasoning is sound and the evidence is relevant and sufficient.', '7', 'Reading Informational Text', 'essential'),
  s('7th-grade-ela', 3, 'W.7.2', 'Write informative/explanatory texts to examine a topic and convey ideas, concepts, and information through selection, organization, and analysis.', '7', 'Writing', 'supporting'),
  s('7th-grade-ela', 4, 'L.7.4', 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases based on grade 7 reading and content.', '7', 'Language', 'unassigned'),
  s('7th-grade-ela', 5, 'RL.6.2', 'Determine a theme or central idea of a text and how it is conveyed through particular details; provide a summary distinct from personal opinions.', '6', 'Reading Literature', 'prerequisite'),

  // 8th Grade Math
  s('8th-grade-math', 1, '8.EE.B.5', 'Graph proportional relationships, interpreting the unit rate as the slope of the graph, and compare two different proportional relationships.', '8', 'Expressions & Equations', 'essential'),
  s('8th-grade-math', 2, '8.F.A.1', 'Understand that a function is a rule that assigns to each input exactly one output. The graph of a function is the set of ordered pairs.', '8', 'Functions', 'essential'),
  s('8th-grade-math', 3, '8.G.B.7', 'Apply the Pythagorean Theorem to determine unknown side lengths in right triangles in real-world and mathematical problems.', '8', 'Geometry', 'supporting'),
  s('8th-grade-math', 4, '8.NS.A.1', 'Know that numbers that are not rational are called irrational, and convert repeating decimals into rational numbers.', '8', 'The Number System', 'unassigned'),
  s('8th-grade-math', 5, '7.EE.B.4a', 'Solve word problems leading to equations of the form px + q = r and p(x + q) = r, where p, q, and r are specific rational numbers.', '7', 'Expressions & Equations', 'prerequisite'),

  // 8th Grade Science
  s('8th-grade-science', 1, 'MS-PS2-2', 'Plan an investigation to provide evidence that the change in an object’s motion depends on the sum of the forces on the object and the mass of the object.', '8', 'Physical Science', 'essential', 'both'),
  s('8th-grade-science', 2, 'MS-PS4-1', 'Use mathematical representations to describe a simple model for waves that includes how the amplitude of a wave is related to the energy in a wave.', '8', 'Physical Science', 'essential', 'integrated'),
  s('8th-grade-science', 3, 'MS-PS1-2', 'Analyze and interpret data on the properties of substances before and after the substances interact to determine if a chemical reaction has occurred.', '8', 'Physical Science', 'supporting', 'discipline-specific'),
  s('8th-grade-science', 4, 'MS-LS4-4', 'Construct an explanation based on evidence that describes how genetic variations of traits in a population increase some individuals’ probability of surviving and reproducing.', '8', 'Life Science', 'supporting', 'integrated'),
  s('8th-grade-science', 5, 'MS-PS3-1', 'Construct and interpret graphical displays of data to describe the relationships of kinetic energy to the mass of an object and to the speed of an object.', '7', 'Physical Science', 'prerequisite', 'both'),

  // 8th Grade Social Studies
  s('8th-grade-social-studies', 1, 'HSS 8.2.3', 'Evaluate the major debates that occurred during the development of the Constitution and their ultimate resolutions in such areas as shared power.', '8', 'U.S. Constitution', 'essential'),
  s('8th-grade-social-studies', 2, 'HSS 8.8.2', 'Describe the purpose, challenges, and economic incentives associated with westward expansion, including the concept of Manifest Destiny.', '8', 'Westward Expansion', 'essential'),
  s('8th-grade-social-studies', 3, 'HSS 8.10.6', 'Describe critical developments and events in the Civil War, including the major battles, geographical advantages, and technological advances.', '8', 'Civil War & Reconstruction', 'supporting'),
  s('8th-grade-social-studies', 4, 'HSS 8.4.1', 'Describe the country’s physical landscapes, political divisions, and territorial expansion during the terms of the first four presidents.', '8', 'Early Republic', 'unassigned'),
  s('8th-grade-social-studies', 5, 'HSS 7.11.5', 'Describe how democratic thought and institutions were influenced by Enlightenment thinkers such as John Locke and Montesquieu.', '7', 'Enlightenment Foundations', 'prerequisite'),

  // 8th Grade ELA
  s('8th-grade-ela', 1, 'RL.8.1', 'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text.', '8', 'Reading Literature', 'essential'),
  s('8th-grade-ela', 2, 'W.8.1', 'Write arguments to support claims with clear reasons and relevant evidence, acknowledging and distinguishing alternate or opposing claims.', '8', 'Writing', 'essential'),
  s('8th-grade-ela', 3, 'RI.8.6', 'Determine an author’s point of view or purpose in a text and analyze how the author acknowledges and responds to conflicting evidence.', '8', 'Reading Informational Text', 'supporting'),
  s('8th-grade-ela', 4, 'SL.8.4', 'Present claims and findings, emphasizing salient points in a focused, coherent manner with relevant evidence and sound valid reasoning.', '8', 'Speaking & Listening', 'unassigned'),
  s('8th-grade-ela', 5, 'W.7.1', 'Write arguments to support claims with clear reasons and relevant evidence.', '7', 'Writing', 'prerequisite'),

  // VAPA Art
  s('vapa-art', 1, 'VA:Cr1.1.7', 'Apply methods to overcome creative blocks and generate innovative ideas for art-making.', '6-8', 'Creating', 'essential'),
  s('vapa-art', 2, 'VA:Cr2.1.7', 'Demonstrate persistence in developing skills with various materials, methods, and approaches in creating works of art or design.', '6-8', 'Creating', 'essential'),
  s('vapa-art', 3, 'VA:Re7.2.7', 'Analyze multiple ways that images influence specific audiences.', '6-8', 'Responding', 'supporting'),
  s('vapa-art', 4, 'VA:Pr5.1.7', 'Based on criteria, analyze and evaluate methods for preparing and presenting art.', '6-8', 'Presenting', 'unassigned'),
  s('vapa-art', 5, 'VA:Cr2.1.5', 'Experiment and develop skills in multiple art-making techniques and approaches through practice.', '5', 'Creating', 'prerequisite'),

  // VAPA CTE
  s('vapa-cte', 1, 'AME.A1.1', 'Demonstrate foundational understanding of design principles, typography, and digital media composition.', '6-8', 'Arts, Media & Entertainment', 'essential'),
  s('vapa-cte', 2, 'CTE.FS.4.1', 'Use digital tools and collaborative workflows effectively to communicate project milestones and iterate prototypes.', '6-8', 'Foundation Standards', 'essential'),
  s('vapa-cte', 3, 'AME.A2.3', 'Apply ethical copyright, attribution, and fair-use practices when incorporating multimedia assets.', '6-8', 'Digital Citizenship', 'supporting'),
  s('vapa-cte', 4, 'CTE.FS.9.3', 'Demonstrate time management, active listening, and shared responsibility in team-based production projects.', '6-8', 'Career Readiness', 'unassigned'),
  s('vapa-cte', 5, 'ISTE.1.6a', 'Choose the appropriate platforms and tools for meeting the desired objectives of creation or communication.', '5', 'Technology Foundations', 'prerequisite'),

  // VAPA Band
  s('vapa-band', 1, 'MU:Pr4.2.E.5a', 'Demonstrate, using music reading skills where appropriate, how the setting and formal characteristics of musical works inform performance.', '6-8', 'Performing', 'essential'),
  s('vapa-band', 2, 'MU:Pr6.1.E.5a', 'Demonstrate attention to technical accuracy and expressive qualities in prepared and improvised performances of a varied repertoire.', '6-8', 'Performing', 'essential'),
  s('vapa-band', 3, 'MU:Cr2.1.E.5a', 'Select and develop draft melodies and rhythmic passages that demonstrate understanding of characteristic elements of music.', '6-8', 'Creating', 'supporting'),
  s('vapa-band', 4, 'MU:Re8.1.E.5a', 'Identify interpretations of the expressive intent and meaning of musical works, referring to the elements of music and context.', '6-8', 'Responding', 'unassigned'),
  s('vapa-band', 5, 'MU:Pr4.2.4b', 'When analyzing selected music, read and perform using iconic and/or standard notation.', '5', 'Music Literacy', 'prerequisite'),

  // VAPA FMS Spanish
  s('vapa-fms-spanish', 1, 'WL.CM1.N', 'Demonstrate understanding of the general meaning and some basic information on familiar everyday topics in Spanish.', '6-8', 'Communication (Interpretive)', 'essential'),
  s('vapa-fms-spanish', 2, 'WL.CM2.N', 'Participate in real-world, spoken, written, or signed conversations on very familiar topics using memorized words and phrases.', '6-8', 'Communication (Interpersonal)', 'essential'),
  s('vapa-fms-spanish', 3, 'WL.CL1.N', 'Use culturally appropriate gestures and formulaic expressions in everyday social interactions.', '6-8', 'Cultures', 'supporting'),
  s('vapa-fms-spanish', 4, 'WL.CN1.N', 'Identify and discuss familiar products and practices from Spanish-speaking communities.', '6-8', 'Connections', 'unassigned'),
  s('vapa-fms-spanish', 5, 'L.5.4a', 'Use context as a clue to the meaning of a word or phrase across languages.', '5', 'Language Foundations', 'prerequisite'),

  // VAPA FMS Spanish 1
  s('vapa-fms-spanish-1', 1, 'WL.CM2.I', 'Participate in real-world conversations on familiar topics by creating simple sentences and asking/answering follow-up questions.', '8', 'Communication (Interpersonal)', 'essential'),
  s('vapa-fms-spanish-1', 2, 'WL.CM3.I', 'Present information on familiar topics and everyday experiences using connected simple sentences in Spanish.', '8', 'Communication (Presentational)', 'essential'),
  s('vapa-fms-spanish-1', 3, 'WL.CM5.I', 'Demonstrate understanding of sentence-level grammatical structures, including present and preterite verb conjugations.', '8', 'Structures', 'supporting'),
  s('vapa-fms-spanish-1', 4, 'WL.CL2.I', 'Experience, recognize, and explore cultural perspectives reflected in authentic Spanish media and traditions.', '8', 'Cultures', 'unassigned'),
  s('vapa-fms-spanish-1', 5, 'WL.CM1.N', 'Demonstrate understanding of general meaning and basic information on familiar everyday topics from introductory Spanish.', '7', 'Communication (Interpretive)', 'prerequisite'),

  // 6th Grade PE
  s('6th-grade-pe', 1, 'PE 6.1.1', 'Volley an object repeatedly with a partner, using the forearm pass.', '6', 'Motor Skills & Movement', 'essential'),
  s('6th-grade-pe', 2, 'PE 6.3.4', 'Participate in moderate to vigorous physical activity a minimum of four days each week.', '6', 'Physical Fitness', 'essential'),
  s('6th-grade-pe', 3, 'PE 6.2.6', 'Explain the role of the legs, shoulders, and forearm in the forearm pass.', '6', 'Movement Concepts', 'supporting'),
  s('6th-grade-pe', 4, 'PE 6.5.2', 'Evaluate individual responsibility in group efforts during physical activities.', '6', 'Social Interaction', 'unassigned'),
  s('6th-grade-pe', 5, 'PE 5.1.14', 'Dribble a ball by hand while preventing another person from stealing the ball.', '5', 'Motor Skills & Movement', 'prerequisite'),

  // 7th Grade PE
  s('7th-grade-pe', 1, 'PE 7.1.1', 'Demonstrate mature techniques for the following patterns: overhand, sidearm, and underhand throwing; catching; kicking/punting; striking; trapping; dribbling.', '7', 'Motor Skills & Movement', 'essential'),
  s('7th-grade-pe', 2, 'PE 7.4.3', 'Develop a one-week personal physical fitness plan specifying the proper warm-up and cool-down activities and the principles of exercise.', '7', 'Fitness Concepts', 'essential'),
  s('7th-grade-pe', 3, 'PE 7.2.2', 'Analyze movement patterns and correct errors in performance.', '7', 'Movement Concepts', 'supporting'),
  s('7th-grade-pe', 4, 'PE 7.5.3', 'Demonstrate an acceptance of differences in physical development and personal preferences as they affect participation in physical activity.', '7', 'Social Interaction', 'unassigned'),
  s('7th-grade-pe', 5, 'PE 6.3.4', 'Participate in moderate to vigorous physical activity a minimum of four days each week.', '6', 'Physical Fitness', 'prerequisite'),

  // 8th Grade PE
  s('8th-grade-pe', 1, 'PE 8.1.4', 'Apply locomotor, nonlocomotor, and manipulative skills to team physical activities.', '8', 'Motor Skills & Movement', 'essential'),
  s('8th-grade-pe', 2, 'PE 8.3.1', 'Assess the components of health-related physical fitness by using a scientifically based health-related fitness assessment.', '8', 'Physical Fitness', 'essential'),
  s('8th-grade-pe', 3, 'PE 8.2.3', 'Explain the appropriate offensive and defensive strategies in team physical activities.', '8', 'Movement Concepts', 'supporting'),
  s('8th-grade-pe', 4, 'PE 8.5.4', 'Identify the contributions of members of a group or team and reward members for accomplishing a task or goal.', '8', 'Social Interaction', 'unassigned'),
  s('8th-grade-pe', 5, 'PE 7.4.3', 'Develop a one-week personal physical fitness plan specifying proper warm-up, cool-down, and exercise principles.', '7', 'Fitness Concepts', 'prerequisite'),

  // 6-8th Grade SDC ELA/Social Studies
  s('6-8-sdc-ela-social-studies', 1, 'RL.6-8.1', 'Cite textual evidence to support analysis of what the text says explicitly as well as basic inferences drawn from the text.', '6-8', 'Reading Literature', 'essential'),
  s('6-8-sdc-ela-social-studies', 2, 'W.6-8.2', 'Write structured informative paragraphs with a clear topic sentence, supporting details, and a concluding statement.', '6-8', 'Writing', 'essential'),
  s('6-8-sdc-ela-social-studies', 3, 'HSS 6-8.CST.1', 'Explain how major events are related to one another in time using timelines and chronological sequencing.', '6-8', 'Historical Thinking', 'supporting'),
  s('6-8-sdc-ela-social-studies', 4, 'SL.6-8.1', 'Participate in structured partner and small-group discussions with sentence frames and active listening.', '6-8', 'Speaking & Listening', 'unassigned'),
  s('6-8-sdc-ela-social-studies', 5, 'RF.5.4', 'Read grade-level or instructional-level text with purpose, accuracy, and comprehension.', '5', 'Foundational Reading', 'prerequisite'),

  // 6-8th Grade SDC Math/Science
  s('6-8-sdc-math-science', 1, '6.NS.B.3', 'Fluently add, subtract, multiply, and divide multi-digit decimals using standard algorithms and visual models.', '6-8', 'The Number System', 'essential', 'none'),
  s('6-8-sdc-math-science', 2, '7.RP.A.1', 'Compute unit rates associated with ratios of fractions and real-world quantities like miles per hour or cost per item.', '6-8', 'Ratios & Proportions', 'essential', 'none'),
  s('6-8-sdc-math-science', 3, 'MS-LS1-1', 'Conduct an investigation to provide evidence that living things are made of cells.', '6-8', 'Life Science', 'supporting', 'integrated'),
  s('6-8-sdc-math-science', 4, 'MS-PS1-2', 'Analyze and interpret data on the properties of substances before and after interactions to identify chemical changes.', '6-8', 'Physical Science', 'supporting', 'discipline-specific'),
  s('6-8-sdc-math-science', 5, '5.NBT.B.7', 'Add, subtract, multiply, and divide decimals to hundredths using concrete models or drawings.', '5', 'Number & Operations in Base Ten', 'prerequisite', 'both'),
];
