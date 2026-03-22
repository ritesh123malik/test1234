export interface PlacementRecord {
    id: number;
    date: string;
    company: string;
    type: string;
    branches: string[];
    cgpa: number;
    roles: string[];
    ctc: number;
    stipend: number;
    fixed: number;
    variable: number;
    esops: number;
    selected: number;
    status: 'Completed' | 'Pending';
    joining?: number;
    lti?: number;
    relocation?: number;
    noncash?: number;
    rsus?: number;
    bonus?: number;
}

export const PLACEMENT_RECORDS: PlacementRecord[] = [
    { id: 1, date: '2025-09-29', company: 'Celebal Technologies', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 5, roles: ['Data Science', 'Data Engineer'], ctc: 700000, stipend: 15000, fixed: 600000, variable: 0, esops: 0, selected: 8, status: 'Completed' },
    { id: 2, date: '2025-09-29', company: 'FreeCharge', type: 'SLI + FTE', branches: [], cgpa: 6, roles: ['Devops', 'Data Engineer', 'QA', 'Frontend Developer', 'Backend Developer (Java)'], ctc: 700000, stipend: 25000, fixed: 700000, variable: 0, esops: 0, selected: 0, status: 'Completed' },
    { id: 3, date: '2025-09-25', company: 'Provakil', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 5, roles: ['Associate Software Developer'], ctc: 650000, stipend: 20000, fixed: 650000, variable: 0, esops: 0, selected: 2, status: 'Completed' },
    { id: 4, date: '2025-09-24', company: 'ShodhAI', type: 'SLI + FTE', branches: ['CSE', 'CCE'], cgpa: 5, roles: ['ML', 'Fullstack', 'SRE'], ctc: 1250000, stipend: 0, fixed: 1250000, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 5, date: '2025-09-23', company: 'Unicommerce', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 5, roles: ['Enterprise Onboarding'], ctc: 550000, stipend: 25000, fixed: 500000, variable: 0, esops: 0, selected: 4, status: 'Completed' },
    { id: 6, date: '2025-09-22', company: 'Nagarro Software', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 6, roles: ['Full Stack Developer'], ctc: 700000, stipend: 30000, fixed: 700000, variable: 0, esops: 0, selected: 4, status: 'Completed' },
    { id: 7, date: '2025-09-22', company: 'TITAN.email', type: 'SLI + FTE', branches: [], cgpa: 7, roles: ['SDE'], ctc: 2500000, stipend: 100000, fixed: 1800000, variable: 700000, esops: 0, selected: 0, status: 'Completed' },
    { id: 8, date: '2025-09-15', company: 'Treebo Hotels', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 6.5, roles: ['Backend Developer'], ctc: 1250000, stipend: 25000, fixed: 1100000, variable: 0, esops: 150000, selected: 2, status: 'Completed' },
    { id: 9, date: '2025-09-15', company: 'Treebo Hotels', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 6.5, roles: ['SDET'], ctc: 950000, stipend: 15000, fixed: 850000, variable: 0, esops: 0, selected: 1, status: 'Completed' },
    { id: 10, date: '2025-09-15', company: 'Treebo Hotels', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 6.5, roles: ['SRE'], ctc: 700000, stipend: 15000, fixed: 600000, variable: 0, esops: 0, selected: 1, status: 'Completed' },
    { id: 11, date: '2025-09-09', company: 'Spring Financial', type: 'SLI + FTE', branches: ['CSE', 'CCE'], cgpa: 6, roles: ['Software Engineer Trainee'], ctc: 1200000, stipend: 25000, fixed: 1200000, variable: 0, esops: 0, selected: 3, status: 'Completed' },
    { id: 12, date: '2025-09-06', company: 'APMSE (Eagleview)', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 5, roles: ['SDE'], ctc: 1284000, stipend: 50000, fixed: 1200000, variable: 0, esops: 0, selected: 7, status: 'Completed' },
    { id: 13, date: '2025-09-02', company: 'ZS Associates', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 7, roles: ['Software Developer', 'Business Analyst', 'DAA'], ctc: 1415000, stipend: 0, fixed: 950000, variable: 0, esops: 0, selected: 23, status: 'Completed' },
    { id: 14, date: '2025-08-29', company: 'DE Shaw', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 7, roles: ['SDE'], ctc: 5930000, stipend: 150000, fixed: 2400000, variable: 400000, esops: 0, selected: 3, status: 'Completed', joining: 400000, lti: 2000000, relocation: 200000, noncash: 530000 },
    { id: 15, date: '2025-08-28', company: 'EPAM', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE'], cgpa: 6, roles: ['Tech Role'], ctc: 848000, stipend: 27500, fixed: 800000, variable: 0, esops: 0, selected: 3, status: 'Completed' },
    { id: 16, date: '2025-08-27', company: 'ProcDNA', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 7, roles: ['Business Analyst', 'Data Science'], ctc: 1674166, stipend: 25000, fixed: 786000, variable: 0, esops: 0, selected: 2, status: 'Completed' },
    { id: 17, date: '2025-08-22', company: 'Media.net', type: 'SLI', branches: ['CSE', 'ECE', 'CCE'], cgpa: 6, roles: ['SDE Intern'], ctc: 0, stipend: 100000, fixed: 0, variable: 0, esops: 0, selected: 1, status: 'Completed' },
    { id: 18, date: '2025-08-21', company: 'Triology', type: 'FTE', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 5, roles: ['SDE'], ctc: 3250000, stipend: 0, fixed: 3000000, variable: 0, esops: 0, selected: 0, status: 'Completed', bonus: 250000 },
    { id: 19, date: '2025-08-20', company: 'E2E Networks', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 7, roles: ['Associate Software Engineer'], ctc: 1200000, stipend: 48200, fixed: 1150000, variable: 0, esops: 0, selected: 5, status: 'Completed' },
    { id: 20, date: '2025-08-05', company: 'Tekion', type: 'SLI + FTE', branches: ['CSE'], cgpa: 7, roles: ['Associate Software Engineer'], ctc: 1999999, stipend: 65000, fixed: 2000000, variable: 0, esops: 0, selected: 5, status: 'Completed' },
    { id: 21, date: '2025-08-05', company: 'Signzy', type: 'SLI + PPO', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 6.5, roles: ['MERN Stack Intern'], ctc: 0, stipend: 40000, fixed: 0, variable: 0, esops: 0, selected: 0, status: 'Completed' },
    { id: 22, date: '2025-07-29', company: 'Whatfix (Quiko)', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 7, roles: ['Software Engineer'], ctc: 1600000, stipend: 50000, fixed: 1300000, variable: 300000, esops: 0, selected: 4, status: 'Completed' },
    { id: 23, date: '2025-07-28', company: 'Eatclub', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 6.5, roles: ['SDE'], ctc: 2200000, stipend: 40000, fixed: 1000000, variable: 200000, esops: 1000000, selected: 5, status: 'Completed' },
    { id: 24, date: '2025-07-22', company: 'MakeMyTrip', type: 'SLI + FTE', branches: ['CSE', 'CCE'], cgpa: 5, roles: ['Software Engineer'], ctc: 2200000, stipend: 50000, fixed: 1200000, variable: 0, esops: 0, selected: 2, status: 'Completed', rsus: 1000000 },
    { id: 25, date: '2025-07-16', company: 'Sprinklr', type: 'SLI + FTE', branches: ['CSE', 'CCE'], cgpa: 7, roles: ['Cloud Engineer'], ctc: 1800000, stipend: 50000, fixed: 1500000, variable: 0, esops: 300000, selected: 2, status: 'Completed' },
    { id: 26, date: '2025-07-16', company: 'Addverb Technologies', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 6, roles: ['Software Developer', 'Mobile Robotics', 'R&D Mechanical'], ctc: 1600447, stipend: 25000, fixed: 1045440, variable: 0, esops: 0, selected: 7, status: 'Completed' },
    { id: 27, date: '2025-07-16', company: 'Triumph Motorcycles', type: 'SLI + FTE', branches: ['Mech'], cgpa: 5, roles: ['Graduate Engineer Trainee'], ctc: 1250000, stipend: 50000, fixed: 0, variable: 0, esops: 0, selected: 4, status: 'Completed' },
    { id: 28, date: '2025-05-27', company: 'Bajaj Finserv Health', type: 'SLI + PPO', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 5, roles: ['Backend Developer (Java)'], ctc: 1220000, stipend: 35000, fixed: 0, variable: 0, esops: 0, selected: 2, status: 'Completed' },
    { id: 29, date: '2025-05-05', company: 'Media.net (Summer)', type: 'Summer Intern', branches: ['CSE', 'ECE', 'CCE'], cgpa: 6, roles: ['SDE Intern'], ctc: 0, stipend: 100000, fixed: 0, variable: 0, esops: 0, selected: 1, status: 'Completed' },
    { id: 30, date: '2024-10-05', company: 'BNY Mellon', type: 'Intern + PPO', branches: ['CSE', 'CCE', 'ECE'], cgpa: 7.5, roles: ['SDE'], ctc: 2200000, stipend: 75000, fixed: 0, variable: 0, esops: 0, selected: 4, status: 'Completed' },
    { id: 31, date: '2024-02-19', company: 'Deloitte', type: 'Intern + PPO', branches: ['CSE', 'ECE', 'CCE', 'Mech'], cgpa: 6, roles: ['Product Engineer', 'DataScience', 'UI/UX'], ctc: 1250000, stipend: 30000, fixed: 1150000, variable: 0, esops: 0, selected: 21, status: 'Completed' },
    { id: 32, date: '2025-11-14', company: 'OneBanc', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE', 'Mech'], cgpa: 7, roles: ['Android', 'iOS', 'Full Stack', 'UI/UX'], ctc: 1200000, stipend: 40000, fixed: 900000, variable: 0, esops: 0, selected: 1, status: 'Completed' },
    { id: 33, date: '2025-10-07', company: 'Curiflow', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE'], cgpa: 6.5, roles: ['Frontend Developer', 'SDE'], ctc: 1500000, stipend: 60000, fixed: 950000, variable: 0, esops: 0, selected: 3, status: 'Completed' },
    { id: 34, date: '2025-10-08', company: 'Aperam', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE'], cgpa: 6, roles: ['AI & Automation Analyst', 'Data Engineer', 'Data Scientist', 'Cyber Sec Analyst', 'SAP Basis'], ctc: 1000000, stipend: 30000, fixed: 100000, variable: 0, esops: 0, selected: 5, status: 'Completed' },
    { id: 35, date: '2025-11-14', company: 'AMD', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE'], cgpa: 7.5, roles: ['Software Engineer', 'Hardware Engineer'], ctc: 1909844, stipend: 40000, fixed: 1342054, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 36, date: '2025-10-17', company: 'GoDaddy', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE', 'Mech'], cgpa: 5, roles: ['Product Manager'], ctc: 2850000, stipend: 40000, fixed: 920000, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 37, date: '2025-11-14', company: 'HSBC', type: 'FTE', branches: ['CSE'], cgpa: 7, roles: ['Trainee Software Engineer'], ctc: 1643000, stipend: 0, fixed: 1503097, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 38, date: '2025-11-14', company: 'Samsung Noida', type: 'SLI', branches: ['CSE', 'ECE', 'CCE'], cgpa: 7.5, roles: ['R&D'], ctc: 0, stipend: 50000, fixed: 0, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 39, date: '2025-11-14', company: 'Media.net (SRE)', type: 'SLI', branches: ['CSE', 'CCE', 'ECE'], cgpa: 6, roles: ['SRE'], ctc: 1450000, stipend: 100000, fixed: 0, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 40, date: '2025-11-14', company: 'Josh Technology Group', type: 'SLI + FTE', branches: ['CSE', 'ECE', 'CCE'], cgpa: 5, roles: ['Associate Software Developer'], ctc: 1078000, stipend: 22500, fixed: 850000, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 41, date: '2025-11-14', company: 'Josh Technology Group', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE'], cgpa: 5, roles: ['Software Quality Analyst'], ctc: 539000, stipend: 20000, fixed: 430000, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 42, date: '2025-11-14', company: 'Park+ (Parviom)', type: 'SLI + FTE', branches: ['CSE', 'CCE', 'ECE', 'Mech'], cgpa: 7, roles: ['SDE-1 Backend'], ctc: 3000000, stipend: 30000, fixed: 800000, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 43, date: '2025-11-14', company: 'Eucloid', type: 'Intern', branches: ['CSE', 'CCE', 'ECE'], cgpa: 5, roles: ['Data Solutions Associate Intern'], ctc: 850000, stipend: 35000, fixed: 0, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 44, date: '2025-11-14', company: 'ION', type: 'FTE', branches: ['CSE', 'CCE', 'ECE'], cgpa: 7.5, roles: ['SDE', 'Data Scientist', 'Tech-Analyst'], ctc: 1730000, stipend: 0, fixed: 1500000, variable: 0, esops: 0, selected: 0, status: 'Pending' },
    { id: 45, date: '2025-11-14', company: 'rtCamp', type: 'Intern + FTE', branches: ['CSE', 'CCE'], cgpa: 0, roles: ['Associate Software Engineer'], ctc: 1150000, stipend: 25000, fixed: 0, variable: 0, esops: 0, selected: 0, status: 'Completed' },
    { id: 46, date: '2025-11-14', company: 'Honda Cars', type: 'Mech', branches: ['Mech'], cgpa: 6, roles: ['Graduate Engineer Trainee'], ctc: 600000, stipend: 20000, fixed: 600000, variable: 0, esops: 0, selected: 1, status: 'Completed' },
];
