# Library Management System — Descriptive Analytics

A beginner-friendly front-end project built with **HTML, CSS, and JavaScript**. It demonstrates library record management and descriptive analytics using sample data.

## Features

- Dashboard: total titles, available copies, active issues, and registered students.
- Books: add, search, edit, and delete book records.
- Students: add, search, edit, and delete student records.
- Issue & Return: issue books to students, track due dates, and mark books as returned.
- Descriptive analytics: category-wise collection chart, issue/return status chart, most borrowed books, availability rate, return rate, and automatically generated observations.
- Local storage: records remain saved in the same browser after refresh.
- CSV export: download transaction records for further analysis.
- Responsive layout for desktop, tablet, and mobile.

## Files

- `index.html` — page structure
- `style.css` — layout and design
- `script.js` — application logic, sample data, charts, and local storage

## Run the project

### Option 1: Open locally
1. Download or extract the project folder.
2. Open `index.html` in a modern web browser.
3. Start using the dashboard. No build step or package installation is needed.

### Option 2: Publish with GitHub Pages
1. Sign in at [GitHub](https://github.com/).
2. Create a **Public** repository named `Library-Management-System`.
3. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository's root.
4. Open the repository's **Settings**.
5. Select **Pages** in the left sidebar.
6. Under **Build and deployment**, select **Deploy from a branch**.
7. Select branch `main` and folder `/ (root)`, then click **Save**.
8. Wait a few minutes and refresh the Pages screen. GitHub will show the published website URL, typically:
   `https://YOUR-USERNAME.github.io/Library-Management-System/`

Your repository link and published website link are different:
- **Repository link**: `https://github.com/YOUR-USERNAME/Library-Management-System`
- **Live website link**: `https://YOUR-USERNAME.github.io/Library-Management-System/`

Replace `YOUR-USERNAME` with your actual GitHub username.

## Important notes

- This is an educational front-end demo, not a secure production library system.
- Data is stored in browser `localStorage`. It does not sync between devices or users, and clearing browser data may remove it.
- The charts are drawn with the browser Canvas API; no chart library is required.
- Sample records are included so the analytics dashboard is populated at first launch.
- Use your own name, class, and institution details in any report you submit. Explain the code and features honestly during your assessment.

## Descriptive Analytics concept

Descriptive analytics answers **“What has happened?”** by summarizing existing records. In this project, it summarizes book categories, borrowing history, issue/return status, availability, and popular titles.
