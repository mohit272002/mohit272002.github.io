/* Audits that every skill / fact / date from the source résumé
   actually appears on the page. Run: node tools/audit-content.js */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// strip tags so we test what a visitor actually reads
const text = html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/&#\d+;/g, ' ')
  .replace(/\s+/g, ' ');

const has = (s) => text.toLowerCase().includes(s.toLowerCase());

let fail = 0;
const need = (label, needles) => {
  const missing = needles.filter(n => !has(n));
  if (missing.length) { fail++; console.log(`  FAIL ${label}: missing ${missing.join(' | ')}`); }
  else console.log(`  OK   ${label} (${needles.length})`);
};

console.log('── identity & contact ──');
need('contact', [
  'Mohit Khairnar', 'Mumbai', 'India', '+91 7990792532',
  'mohitkhairnar08@gmail.com', 'LinkedIn', 'GitHub',
]);

console.log('── title & employer ──');
need('role', ['AI & Backend Engineer', 'Backend Developer', 'Tata Consultancy Services', 'TCS']);

console.log('── dates ──');
need('dates', ['Aug 2024', 'Present', 'Jun 2021', 'Mar 2024', 'Apr 2018', 'Mar 2021', 'Maharashtra']);

console.log('── education ──');
need('education', [
  'Bachelor of Engineering', 'Information Technology',
  'Sardar Vallabhbhai Patel Institute of Technology', 'Anand', 'Gujarat', '8.5',
  'Diploma', 'Parul Polytechnic Institute of Technology', 'Vadodara', '9.6',
]);

console.log('── certifications ──');
need('certs', ['AWS Certified Cloud Practitioner', 'AWS Certified AI Practitioner']);

console.log('── skills: every item from the résumé ──');
const SKILLS = [
  'LLMs', 'Agentic AI Frameworks', 'RAG Architectures', 'Prompt Engineering', 'LangChain',
  'LlamaIndex', 'OpenAI API', 'Hugging Face Transformers',
  'Python', 'TensorFlow', 'Scikit-learn', 'Spark', 'SQL', 'PL/SQL', 'AI/ML Pipelines',
  'Data Preparation & ETL Workflows',
  'AWS Certified', 'Databricks', 'Docker', 'Kubernetes', 'CI/CD',
  'Model Deployment & Monitoring', 'AI Governance', 'Bias Detection Awareness',
  'Hallucination Mitigation', 'Output Safety Guardrails', 'Harness', 'Explainability Concepts',
  'Pinecone', 'Qdrant', 'FAISS', 'REST APIs', 'Microservices', 'Apache Kafka',
  'JavaScript', 'Java', 'C++', 'C# (.NET)', 'Django', 'FastAPI', 'ExpressJS', 'ReactJS',
  'MySQL', 'Oracle PL/SQL', 'MongoDB', 'Git',
];
need('skills', SKILLS);

console.log('── skill group headings ──');
need('skill groups', [
  'Generative AI & LLMs', 'AI/ML & Data', 'Cloud & Platforms',
  'MLOps / LLMOps & Responsible AI', 'Vector Databases & Integration',
  'Programming & Frameworks', 'Databases & Version Control',
]);

console.log('── experience bullets (key claims) ──');
need('experience', [
  'LangChain, LlamaIndex and the OpenAI API',
  'improving resolution time by 40%',
  '50+ MB of trade data per day',
  '2M+ daily stock transactions',
  'NSE/BSE',
  'Apache Kafka',
  'MLOps principles',
  'concurrency and asynchronous processing patterns',
  '99% system availability',
  '6+ banking brokers',
  'zero-downtime production releases',
  '1-hour SLAs',
  'golden datasets',
  'accuracy, relevance and hallucination rate',
  'LLaMA, Mistral',
  'LoRA/QLoRA',
]);

console.log('── projects ──');
need('projects', [
  'Enterprise RAG Knowledge Assistant',
  'FAISS vector store',
  'output validation guardrails',
  'Workotopia',
  'BERT embeddings',
  'cosine similarity',
  'Magna',
  'IoT-enabled crop and soil monitoring',
  'ensemble ML models',
  '95% prediction accuracy',
]);

console.log('── project tech stacks ──');
need('project stacks', [
  'Streamlit', 'Hugging Face', 'Scikit-learn', 'Flask', 'Firebase', 'React',
]);

console.log('');
console.log(fail === 0 ? '✓ résumé fully represented on the page' : `✗ ${fail} group(s) incomplete`);
process.exit(fail === 0 ? 0 : 1);