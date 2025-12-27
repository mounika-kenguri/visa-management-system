con
st form = document.getElementById('application-form');
const fileInput = document.getElementById('file-input');
const fileHint = document.getElementById('file-hint');
const fileList = document.getElementById('file-list');
const statusCards = document.getElementById('status-cards');
const filterType = document.getElementById('filter-type');
const prefillBtn = document.getElementById('prefill-btn');

const statusSteps = ['Submitted', 'Under Review', 'Documents Verified', 'Approved'];
const storageKey = 'visa-applications';
let applications = [];

function loadFromStorage() {
 const saved = localStorage.getItem(storageKey);
 if (saved) {
 try {
 applications = JSON.parse(saved);
 } catch (err) {
 applications = [];
 }
 }
}

function saveToStorage() {
 localStorage.setItem(storageKey, JSON.stringify(applications));
}

function updateFileList(files) {
 fileList.innerHTML = '';
 if (!files || files.length === 0) {
 fileHint.textContent = 'No files chosen yet.';
 return;
 }
 fileHint.textContent = `${files.length} file(s) ready to attach.`;
 Array.from(files).forEach((file) => {
 const li = document.createElement('li');
 li.textContent = file.name;
 fileList.appendChild(li);
 });
}

function makeId() {
 const random = Math.floor(Math.random() * 9000) + 1000;
 return `VISA-${random}`;
}

function formToApplication(data) {
 const files = fileInput.files ? Array.from(fileInput.files).map((f) => f.name) : [];
 return {
 id: makeId(),
 fullName: data.get('fullName'),
 email: data.get('email'),
 passport: data.get('passport'),
 nationality: data.get('nationality'),
 visaType: data.get('visaType'),
 travelDate: data.get('travelDate'),
 purpose: data.get('purpose'),
 files,
 statusIndex: 0,
 createdAt: new Date().toISOString(),
 };
}

function statusBadge(step) {
 const span = document.createElement('span');
 span.className = 'badge';
 span.textContent = statusSteps[step];
 return span;
}

function buildSteps(current) {
 const container = document.createElement('div');
 container.className = 'status-steps';
 statusSteps.forEach((label, index) => {
 const step = document.createElement('div');
 step.className = 'step';
 if (index <= current) step.classList.add('active');
 step.textContent = label;
 container.appendChild(step);
 });
 return container;
}

function renderApplications() {
 statusCards.innerHTML = '';
 const filter = filterType.value;
 const visible = applications.filter((app) => filter === 'all' || app.visaType === filter);

 if (visible.length === 0) {
 const empty = document.createElement('p');
 empty.className = 'microcopy';
 empty.textContent = 'No applications yet. Submit the form to see them here.';
 statusCards.appendChild(empty);
 return;
 }

 visible.forEach((app) => {
 const card = document.createElement('div');
 card.className = 'card status-card';

 const header = document.createElement('div');
 header.className = 'status-header';
 const title = document.createElement('div');
 title.className = 'status-title';
 title.innerHTML = `<strong>${app.fullName}</strong><span class="microcopy">${app.id} • ${app.nationality}</span>`;
 header.appendChild(title);
 header.appendChild(statusBadge(app.statusIndex));

 const steps = buildSteps(app.statusIndex);

 const details = document.createElement('p');
 details.className = 'microcopy';
 details.textContent = `${app.visaType} visa • Travel: ${app.travelDate} • Files: ${app.files.length}`;

 const docs = document.createElement('ul');
 docs.className = 'microcopy';
 docs.style.paddingLeft = '16px';
 app.files.forEach((name) => {
 const li = document.createElement('li');
 li.textContent = name;
 docs.appendChild(li);
 });
 if (app.files.length === 0) {
 const li = document.createElement('li');
 li.textContent = 'No files attached yet.';
 docs.appendChild(li);
 }

 const actions = document.createElement('div');
 actions.className = 'card-actions';

 const purpose = document.createElement('span');
 purpose.className = 'microcopy';
 purpose.textContent = app.purpose;

 const advance = document.createElement('button');
 advance.className = 'pill primary';
 advance.textContent = app.statusIndex >= statusSteps.length - 1 ? 'Complete' : 'Advance status';
 advance.disabled = app.statusIndex >= statusSteps.length - 1;
 advance.addEventListener('click', () => {
 if (app.statusIndex < statusSteps.length - 1) {
 app.statusIndex += 1;
 saveToStorage();
 renderApplications();
 }
 });

 actions.appendChild(purpose);
 actions.appendChild(advance);

 card.appendChild(header);
 card.appendChild(steps);
 card.appendChild(details);
 card.appendChild(docs);
 card.appendChild(actions);

 statusCards.appendChild(card);
 });
}

function handleSubmit(event) {
 event.preventDefault();
 const data = new FormData(form);
 if (![...data.values()].every((val) => val && String(val).trim().length > 0)) {
 alert('Please fill every field.');
 return;
 }
 const application = formToApplication(data);
 applications.unshift(application);
 saveToStorage();
 renderApplications();
 form.reset();
 updateFileList([]);
}

function handleFileChange(event) {
 updateFileList(event.target.files);
}

function prefillDemo() {
 applications = [
 {
 id: 'VISA-2024',
 fullName: 'Priya Raman',
 email: 'priya.r@example.com',
 passport: 'P1122334',
 nationality: 'India',
 visaType: 'Business',
 travelDate: '2025-02-12',
 purpose: 'Client onboarding workshop',
 files: ['passport.pdf', 'invitation-letter.pdf'],
 statusIndex: 1,
 createdAt: new Date().toISOString(),
 },
 {
 id: 'VISA-8841',
 fullName: 'Leo Carter',
 email: 'leo.c@example.com',
 passport: 'B9988776',
 nationality: 'United States',
 visaType: 'Tourist',
 travelDate: '2025-03-05',
 purpose: 'Family vacation and sightseeing',
 files: ['passport.pdf'],
 statusIndex: 2,
 createdAt: new Date().toISOString(),
 },
 {
 id: 'VISA-5520',
 fullName: 'Sara Lee',
 email: 'sara.lee@example.com',
 passport: 'C4455667',
 nationality: 'Canada',
 visaType: 'Student',
 travelDate: '2025-08-20',
 purpose: 'Graduate program enrollment',
 files: ['passport.pdf', 'admission-letter.pdf', 'bank-statement.pdf'],
 statusIndex: 0,
 createdAt: new Date().toISOString(),
 },
 ];
 saveToStorage();
 renderApplications();
}

function init() {
 loadFromStorage();
 renderApplications();
 form.addEventListener('submit', handleSubmit);
 fileInput.addEventListener('change', handleFileChange);
 filterType.addEventListener('change', renderApplications);
 prefillBtn.addEventListener('click', prefillDemo);
}

init();