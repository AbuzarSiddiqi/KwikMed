document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('heartDiseaseForm');
    const resultDiv = document.getElementById('result');
    const reportDiv = document.getElementById('report');
    const generateReportBtn = document.getElementById('generateReport');
    const learnMoreBtn = document.getElementById('learnMore');
    const popup = document.getElementById('popup');
    const closePopup = document.getElementById('closePopup');

    function predictRisk(data) {
        let riskScore = 0;
        if (data.age > 60) riskScore += 2;
        else if (data.age > 50) riskScore += 1;
        if (data.cp >= 2) riskScore += 2;
        if (data.trestbps > 140) riskScore += 2;
        else if (data.trestbps > 120) riskScore += 1;
        if (data.chol > 240) riskScore += 2;
        else if (data.chol > 200) riskScore += 1;
        if (data.fbs === '1') riskScore += 1;
        if (data.exang === '1') riskScore += 2;
        if (parseFloat(data.oldpeak) > 2) riskScore += 2;
        return riskScore;
    }

    function generateReport(data, riskScore) {
        const riskLevel = riskScore >= 6 ? 'High' : 'Low';
        const recommendations = [];
        if (data.trestbps > 120) {
            recommendations.push('Monitor blood pressure regularly');
        }
        if (data.chol > 200) {
            recommendations.push('Consider cholesterol management strategies');
        }
        if (data.fbs === '1') {
            recommendations.push('Monitor blood sugar levels');
        }
        return { patientData: data, riskLevel, riskScore, recommendations };
    }

    function displayResult(riskScore) {
        resultDiv.style.display = 'block';
        resultDiv.className = 'result-container ' + (riskScore >= 6 ? 'result-high' : 'result-low');
        resultDiv.innerHTML = `
            <h2>Risk Assessment Result</h2>
            <p>Risk Score: ${riskScore}/10</p>
            <p>Risk Level: ${riskScore >= 6 ? 'High' : 'Low'}</p>
        `;
    }

    function displayReport(report) {
        reportDiv.style.display = 'block';
        reportDiv.innerHTML = `
            <h2>KWIKMED Health Report</h2>
            <div class="report-section">
                <h3>Patient Information</h3>
                <p>Age: ${report.patientData.age}</p>
                <p>Gender: ${report.patientData.sex === '1' ? 'Male' : 'Female'}</p>
                <p>Blood Pressure: ${report.patientData.trestbps} mm Hg</p>
                <p>Cholesterol: ${report.patientData.chol} mg/dl</p>
            </div>
            <div class="report-section">
                <h3>Risk Assessment</h3>
                <p>Risk Level: ${report.riskLevel}</p>
                <p>Risk Score: ${report.riskScore}/10</p>
            </div>
            <div class="report-section">
                <h3>Recommendations</h3>
                <ul>
                    ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
        generatePDF(report);
    }

    function generatePDF(report) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('KWIKMED Health Report', 20, 20);
        doc.setFontSize(12);
        doc.text(`Age: ${report.patientData.age}`, 20, 30);
        doc.text(`Gender: ${report.patientData.sex === '1' ? 'Male' : 'Female'}`, 20, 40);
        doc.text(`Blood Pressure: ${report.patientData.trestbps} mm Hg`, 20, 50);
        doc.text(`Cholesterol: ${report.patientData.chol} mg/dl`, 20, 60);
        doc.text(`Risk Level: ${report.riskLevel}`, 20, 70);
        doc.text(`Risk Score: ${report.riskScore}/10`, 20, 80);
        doc.text('Recommendations:', 20, 90);
        let y = 100;
        report.recommendations.forEach((rec, index) => {
            doc.text(`${index + 1}. ${rec}`, 20, y);
            y += 10;
        });
        doc.save('KWIKMED_Health_Report.pdf');
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            age: document.getElementById('age').value,
            sex: document.getElementById('sex').value,
            cp: document.getElementById('cp').value,
            trestbps: document.getElementById('trestbps').value,
            chol: document.getElementById('chol').value,
            fbs: document.getElementById('fbs').value,
            restecg: document.getElementById('restecg').value,
            thalach: document.getElementById('thalach').value,
            exang: document.getElementById('exang').value,
            oldpeak: document.getElementById('oldpeak').value
        };
        const riskScore = predictRisk(formData);
        displayResult(riskScore);
        form.dataset.lastAssessment = JSON.stringify({ formData, riskScore });
    });

    generateReportBtn.addEventListener('click', function() {
        if (form.dataset.lastAssessment) {
            const lastAssessment = JSON.parse(form.dataset.lastAssessment);
            const report = generateReport(lastAssessment.formData, lastAssessment.riskScore);
            displayReport(report);
        } else {
            alert('Please complete a risk assessment first.');
        }
    });

    learnMoreBtn.addEventListener('click', function() {
        popup.style.display = 'block';
    });

    closePopup.addEventListener('click', function() {
        popup.style.display = 'none';
    });
    
});
