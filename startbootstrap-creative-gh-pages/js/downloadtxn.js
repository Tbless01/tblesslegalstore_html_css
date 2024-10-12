// Fetch transaction data from the endpoint
async function fetchTransactionData() {
    const customerCode = localStorage.getItem('customerCode');
    const token = localStorage.getItem('token');

    try {
        const transactionResponse = await fetch(
            `https://drab-rozamond-tbless01-2ae1501e.koyeb.app/tblesslegalstore/v1/api/transactions/${customerCode}`, 
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (transactionResponse.status === 401 || transactionResponse.status === 403) {
            console.log('Token expired or unauthorized. Redirecting to home page...');
            localStorage.clear();  // Clear all local storage items
            window.location.href = 'google-login-page-for-txn.html';
            return;
        }

        if (!transactionResponse.ok) {
            throw new Error('Failed to fetch transaction data');
        }

        const transactionData = await transactionResponse.json();
        const transaction = transactionData.data;

        const packageResponse = await fetch(
            `https://drab-rozamond-tbless01-2ae1501e.koyeb.app/tblesslegalstore/v1/api/packages/${transaction.packageCode}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!packageResponse.ok) {
            throw new Error('Failed to fetch package data');
        }

        const packageData = await packageResponse.json();
        const packageName = packageData.data.packageName;

        const formattedDate = formatDate(transaction.dateLastPaymentMade);

        document.getElementById('transactionDataBody').innerHTML = `
            <tr>
                <td>${transaction.transactionCode}</td>
                <td>${packageName}</td>
                <td>${transaction.totalAmountPaid.toLocaleString()}</td>
                <td>${transaction.amountLastPaid.toLocaleString()}</td>
                <td>${transaction.balance.toLocaleString()}</td>
                <td>${formattedDate}</td>
                <td>${transaction.status}</td>
            </tr>
        `;
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('transactionDataBody').innerHTML = 
            `<tr><td colspan="7">Error fetching data</td></tr>`;
    }
}

// Format date function
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();

    const getSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        return ['th', 'st', 'nd', 'rd'][day % 10] || 'th';
    };

    const formattedDate = `${day}${getSuffix(day)} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12 || 12}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;

    return `${formattedDate} ${formattedTime}`;
}





// Download PDF
document.getElementById("downloadPdfButton").addEventListener("click", function() {
    const hiddenTable = document.getElementById("downloadContent");

    // Ensure there is content to download
    if (!hiddenTable.children.length) {
        console.error("No content to download");
        return;
    }

    // Prepare the download content directly
    const transactionRows = [...document.querySelectorAll("#transactionDataBody tr")];

    if (transactionRows.length === 0) {
        console.error("No transaction data available");
        return;
    }

    // Create content for download directly
    hiddenTable.innerHTML = transactionRows.map((row, index) => `
        <div style="margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #ddd;">
            <h3 style="color: #4a4a4a; font-size: 18px; margin-bottom: 10px;">Transaction ${index + 1}</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr style="border: 1px solid #ddd;">
                    <td style="width: 30%; font-weight: bold; padding: 10px; border: 1px solid #ddd;">Transaction Code:</td>
                    <td style="width: 70%; padding: 10px; border: 1px solid #ddd;">${row.cells[0].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Package Name:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[1].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Total Amount:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[2].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Amount Paid:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[3].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Balance:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[4].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Date Last Payment:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[5].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Status:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[6].textContent}</td>
                </tr>
            </table>
        </div>`).join('');

    // Set options for the PDF
    const options = {
        margin:       1,
        filename:     'transaction-details.pdf',
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Generate PDF
    html2pdf().from(hiddenTable).set(options).save();
});

// Call the function on page load
fetchTransactionData();






// Download Image
document.getElementById("downloadImageButton").addEventListener("click", function() {
    const hiddenTable = document.getElementById("downloadContent");

    // No need to check for hiddenTable since it will be visible
    // If you previously hid any content, ensure to remove that logic

    // Ensure there is content to download
    if (!hiddenTable.children.length) {
        console.error("No content to download");
        return;
    }

    // Prepare the download content directly without hiding
    const transactionRows = [...document.querySelectorAll("#transactionDataBody tr")];

    if (transactionRows.length === 0) {
        console.error("No transaction data available");
        return;
    }

    // Create content for download directly
    hiddenTable.innerHTML = transactionRows.map((row, index) => `
        <div style="margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #ddd;">
            <h3 style="color: #4a4a4a; font-size: 18px; margin-bottom: 10px;">Transaction ${index + 1}</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                <tr style="border: 1px solid #ddd;">
                    <td style="width: 30%; font-weight: bold; padding: 10px; border: 1px solid #ddd;">Transaction Code:</td>
                    <td style="width: 70%; padding: 10px; border: 1px solid #ddd;">${row.cells[0].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Package Name:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[1].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Total Amount:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[2].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Amount Paid:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[3].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Balance:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[4].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Date Last Payment:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[5].textContent}</td>
                </tr>
                <tr style="border: 1px solid #ddd;">
                    <td style="font-weight: bold; padding: 10px; border: 1px solid #ddd;">Status:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${row.cells[6].textContent}</td>
                </tr>
            </table>
        </div>`).join('');

    console.log("Content prepared for download:", hiddenTable.innerHTML);

    // Generate image from visible content
    html2canvas(hiddenTable, {
        useCORS: true,
        backgroundColor: "#fff"  // Set a white background for the image
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL("image/png");
        link.download = 'transaction-details.png';
        link.click();
    }).catch(err => console.error("Error generating image:", err));
});

// Call the function on page load
fetchTransactionData();
