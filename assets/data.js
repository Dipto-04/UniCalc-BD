// ==========================================================
// UniCalc BD — Data Layer
// Grading scales, university profiles, and waiver policies.
// BUBT is fully modeled per official policy. Other universities
// carry representative/common private-university figures and are
// clearly marked as indicative — update via ADMIN_NOTE below.
// ==========================================================

const GRADE_SCALE_STANDARD = [
  { grade: "A+", min: 80, max: 100, point: 4.00 },
  { grade: "A",  min: 75, max: 79,  point: 3.75 },
  { grade: "A-", min: 70, max: 74,  point: 3.50 },
  { grade: "B+", min: 65, max: 69,  point: 3.25 },
  { grade: "B",  min: 60, max: 64,  point: 3.00 },
  { grade: "B-", min: 55, max: 59,  point: 2.75 },
  { grade: "C+", min: 50, max: 54,  point: 2.50 },
  { grade: "C",  min: 45, max: 49,  point: 2.25 },
  { grade: "D",  min: 40, max: 44,  point: 2.00 },
  { grade: "F",  min: 0,  max: 39,  point: 0.00 },
];

// Slightly different common scale used by a few universities (illustrative)
const GRADE_SCALE_ALT = [
  { grade: "A+", min: 80, max: 100, point: 4.00 },
  { grade: "A",  min: 76, max: 79,  point: 3.75 },
  { grade: "A-", min: 73, max: 75,  point: 3.50 },
  { grade: "B+", min: 70, max: 72,  point: 3.25 },
  { grade: "B",  min: 66, max: 69,  point: 3.00 },
  { grade: "B-", min: 63, max: 65,  point: 2.75 },
  { grade: "C+", min: 60, max: 62,  point: 2.50 },
  { grade: "C",  min: 57, max: 59,  point: 2.25 },
  { grade: "D",  min: 55, max: 56,  point: 2.00 },
  { grade: "F",  min: 0,  max: 54,  point: 0.00 },
];

const ADMIN_NOTE = "Figures for universities other than BUBT are indicative placeholders for demo purposes. Replace with each university's official published policy before production use.";

const UNIVERSITIES = [
  {
    id: "bubt",
    name: "BUBT",
    fullName: "Bangladesh University of Business and Technology",
    color: "#2563EB",
    verified: true,
    description: "One of the largest private universities in Bangladesh, known for Business, Engineering and CSE programs with a structured merit-waiver system.",
    gradingScale: GRADE_SCALE_STANDARD,
    minGraduationCGPA: 2.00,
    creditRequirement: "140-160 credits depending on program",
    retakePolicy: "Fail (F) means mandatory retake. No optional course retake allowed once passed.",
    departments: ["CSE", "EEE", "Textile Engineering", "BBA", "English", "Law", "Sociology", "Architecture"],
    entryWaiver: [
      { label: "Golden GPA 5 + GPA 5 (SSC & HSC)", value: "100%" },
      { label: "Combined GPA 9.50+", value: "75%" },
      { label: "High Merit", value: "50%" },
      { label: "Eligible Merit", value: "25%" },
    ],
    continuingWaiver: [
      { min: 3.95, max: 4.00, percent: 100 },
      { min: 3.85, max: 3.94, percent: 50 },
      { min: 3.75, max: 3.84, percent: 25 },
    ],
    minWaiverCGPAByDept: {
      "Engineering": 3.25,
      "Business": 3.00,
      "Law": 3.00,
      "Arts": 3.00,
    },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Merit-based tuition waiver renewed each semester subject to minimum CGPA per department; no course retake permitted for waiver-holding students.",
  },
  {
    id: "brac", name: "BRAC University", fullName: "BRAC University", color: "#8B1E3F", verified: false,
    description: "A leading liberal-arts-influenced private university with strong CSE, BBA and Architecture programs.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "136-148 credits depending on program",
    retakePolicy: "Retake allowed for grade improvement, subject to university policy.",
    departments: ["CSE", "EEE", "BBA", "Architecture", "English", "Economics"],
    entryWaiver: [{ label: "GPA 5+5 (SSC & HSC)", value: "100%" }, { label: "GPA 9.0+", value: "50%" }, { label: "GPA 8.0+", value: "25%" }],
    continuingWaiver: [{ min: 3.85, max: 4.00, percent: 50 }, { min: 3.50, max: 3.84, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.30, "Business": 3.30, "Arts": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester-based merit scholarship reviewed on continuing CGPA.",
  },
  {
    id: "nsu", name: "NSU", fullName: "North South University", color: "#00539C", verified: false,
    description: "The first private university in Bangladesh, with an extensive School of Business and Engineering.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "120-136 credits depending on program",
    retakePolicy: "Retake allowed; best grade typically counted per policy.",
    departments: ["CSE", "EEE", "BBA", "Economics", "Pharmacy", "English"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.50+", value: "50%" }, { label: "GPA 9.00+", value: "25%" }],
    continuingWaiver: [{ min: 3.80, max: 4.00, percent: 50 }, { min: 3.50, max: 3.79, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00, "Arts": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Merit scholarship reassessed every trimester.",
  },
  {
    id: "aiub", name: "AIUB", fullName: "American International University-Bangladesh", color: "#7A1F2B", verified: false,
    description: "Known for its Engineering and CS programs with a trimester system.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "136-152 credits depending on program",
    retakePolicy: "Retake permitted for CGPA improvement.",
    departments: ["CSE", "EEE", "BBA", "Architecture", "Computer Science"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }, { label: "GPA 8.0+", value: "25%" }],
    continuingWaiver: [{ min: 3.90, max: 4.00, percent: 50 }, { min: 3.60, max: 3.89, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00, "Arts": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Trimester-based merit review.",
  },
  {
    id: "diu", name: "DIU", fullName: "Daffodil International University", color: "#F26A21", verified: false,
    description: "Large-scale private university with wide-reaching scholarship coverage.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "140-160 credits depending on program",
    retakePolicy: "Retake allowed as per academic policy.",
    departments: ["CSE", "EEE", "BBA", "Textile Engineering", "English"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }, { label: "GPA 8.0+", value: "25%" }],
    continuingWaiver: [{ min: 3.75, max: 4.00, percent: 50 }, { min: 3.50, max: 3.74, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00, "Arts": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Merit-based waiver reviewed each semester.",
  },
  {
    id: "uiu", name: "UIU", fullName: "United International University", color: "#E2231A", verified: false,
    description: "Trimester-based university known for CSE and strong research culture.",
    gradingScale: GRADE_SCALE_ALT, minGraduationCGPA: 2.00, creditRequirement: "136-148 credits depending on program",
    retakePolicy: "Retake permitted for grade replacement.",
    departments: ["CSE", "EEE", "BBA", "Economics"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.85, max: 4.00, percent: 50 }, { min: 3.50, max: 3.84, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Trimester merit scholarship.",
  },
  {
    id: "ewu", name: "EWU", fullName: "East West University", color: "#005BAA", verified: false,
    description: "Established private university with strong Business and CSE programs.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "130-142 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["CSE", "EEE", "BBA", "English"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.80, max: 4.00, percent: 50 }, { min: 3.50, max: 3.79, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester-based merit review.",
  },
  {
    id: "iub", name: "IUB", fullName: "Independent University, Bangladesh", color: "#8A2432", verified: false,
    description: "Liberal arts-style curriculum with strong Business, Environmental Science and CSE programs.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "130-136 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["CSE", "BBA", "Environmental Science", "English"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.85, max: 4.00, percent: 50 }, { min: 3.50, max: 3.84, percent: 25 }],
    minWaiverCGPAByDept: { "Business": 3.00, "Arts": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review.",
  },
  {
    id: "uap", name: "UAP", fullName: "University of Asia Pacific", color: "#004C97", verified: false,
    description: "Known especially for Architecture and Civil Engineering programs.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "144-160 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["CSE", "EEE", "Civil Engineering", "Architecture", "BBA"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.80, max: 4.00, percent: 50 }, { min: 3.50, max: 3.79, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.25, "Business": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review.",
  },
  {
    id: "seu", name: "SEU", fullName: "Southeast University", color: "#1B5E20", verified: false,
    description: "Mid-sized private university with a broad range of undergraduate and graduate programs.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "136-152 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["CSE", "EEE", "BBA", "Law"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.75, max: 4.00, percent: 50 }, { min: 3.50, max: 3.74, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00, "Law": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review.",
  },
  {
    id: "aust", name: "AUST", fullName: "Ahsanullah University of Science and Technology", color: "#00274D", verified: false,
    description: "Engineering-focused university with a strong reputation in CSE and EEE.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "160 credits (Engineering)",
    retakePolicy: "Retake permitted per academic policy.",
    departments: ["CSE", "EEE", "Civil Engineering", "Mechanical Engineering", "Architecture"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.85, max: 4.00, percent: 50 }, { min: 3.60, max: 3.84, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.25 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review, engineering-focused.",
  },
  {
    id: "green", name: "Green University", fullName: "Green University of Bangladesh", color: "#2E7D32", verified: false,
    description: "Growing private university with programs across Engineering, Business and Arts.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "140-160 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["CSE", "EEE", "BBA", "English", "Law"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 9.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.80, max: 4.00, percent: 50 }, { min: 3.50, max: 3.79, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review.",
  },
  {
    id: "northern", name: "Northern University", fullName: "Northern University Bangladesh", color: "#4A148C", verified: false,
    description: "Private university offering Business, Arts and Engineering programs.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "136-152 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["CSE", "BBA", "English", "Law"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 8.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.75, max: 4.00, percent: 50 }, { min: 3.50, max: 3.74, percent: 25 }],
    minWaiverCGPAByDept: { "Business": 3.00, "Arts": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review.",
  },
  {
    id: "city", name: "City University", fullName: "City University Bangladesh", color: "#B71C1C", verified: false,
    description: "Private university with a broad undergraduate portfolio.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "136-152 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["CSE", "EEE", "BBA", "English"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 8.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.75, max: 4.00, percent: 50 }, { min: 3.50, max: 3.74, percent: 25 }],
    minWaiverCGPAByDept: { "Engineering": 3.00, "Business": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review.",
  },
  {
    id: "seu2", name: "Southeast Univ. (Arts)", fullName: "Southeast University — Arts & Humanities", color: "#00695C", verified: false,
    description: "Placeholder profile representing additional Southeast-affiliated programs.",
    gradingScale: GRADE_SCALE_STANDARD, minGraduationCGPA: 2.00, creditRequirement: "130-140 credits",
    retakePolicy: "Retake permitted per policy.",
    departments: ["English", "Sociology", "Law"],
    entryWaiver: [{ label: "GPA 5+5", value: "100%" }, { label: "GPA 8.0+", value: "50%" }],
    continuingWaiver: [{ min: 3.75, max: 4.00, percent: 50 }],
    minWaiverCGPAByDept: { "Arts": 3.00 },
    waiverAppliesTo: "Tuition Fee only",
    scholarshipPolicy: "Semester merit review.",
  },
];

function findUniversity(id) {
  return UNIVERSITIES.find(u => u.id === id);
}

function gradeFromMarks(scale, marks) {
  const m = Number(marks);
  for (const row of scale) {
    if (m >= row.min && m <= row.max) return row;
  }
  return scale[scale.length - 1];
}

function gradePointByLetter(scale, letter) {
  const row = scale.find(r => r.grade === letter);
  return row ? row.point : 0;
}
