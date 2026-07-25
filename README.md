🚀 **PagePulse**

PagePulse is a full-stack website SEO audit application built using React.js (Vite) and Spring Boot. The application allows users to enter a website URL and receive a comprehensive SEO report, including metadata, heading structure, image accessibility, page performance, link analysis, HTTPS status, and other essential website health metrics. The project is designed with a clean, responsive interface and a scalable backend architecture for reliable audit processing.

---

🌐 **Live Demo**

**Frontend:**
https://page-pulse-ui.vercel.app/

**Backend API:**
https://page-pulse-backend-server-production.up.railway.app/api/v1/audit

---

⚙️ **Setup**

**Frontend**

1. Clone the frontend repository.

2. Navigate to the frontend project directory.

3. Install all required dependencies using:

```bash
npm install
```

4. Start the development server using:

```bash
npm run dev
```

5. Open the application in your browser:

```
http://localhost:5173
```

**Backend**

1. Clone the backend repository.

2. Navigate to the backend project directory.

3. Build and run the Spring Boot application using:

```bash
mvn spring-boot:run
```

4. Open the backend server:

```
http://localhost:8080
```

**Environment Variable**

Create a `.env` file inside the frontend project and add the following variable:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

---

📡 **API Contract**

The PagePulse backend exposes a RESTful API that allows the frontend to submit a website URL and receive a comprehensive SEO audit report. The API follows a request-response architecture and communicates using JSON.

**Base URL**

```
https://page-pulse-backend-server-production.up.railway.app/api/v1
```

**Endpoint**

```
POST /audit
```

**Purpose**

This endpoint accepts a publicly accessible website URL, performs an SEO audit, and returns website analysis metrics such as page title, meta description, heading structure, response time, page size, HTTPS status, internal links, external links, broken links, and other SEO-related information.

**Request Body**

```json
{
  "url": "https://example.com"
}
```

**Success Response (200 OK)**

```json
{
  "status": 200,
  "pageTitle": "Example Domain",
  "metaDescription": "Example website description",
  "h1Count": 1,
  "wordCount": 350,
  "internalLinks": 15,
  "externalLinks": 4,
  "brokenLinkCount": 0,
  "httpsEnabled": true,
  "responseTime": 420
}
```

**Error Response (400 Bad Request)**

```json
{
  "code": 400,
  "message": "Invalid URL"
}
```

---

🎯 **Design Decisions**

**1. Separate Frontend and Backend Architecture**

The application is designed with a separate React frontend and Spring Boot backend. This architecture improves maintainability, allows independent development and deployment, and makes the application easier to scale in the future. It also ensures a clear separation of responsibilities between the user interface and the business logic.

**2. Centralized API Communication**

All API requests are managed through a dedicated Axios client and service layer instead of making HTTP requests directly from React components. This approach keeps the codebase clean, improves reusability, simplifies error handling, and makes future API updates easier without affecting the UI components.

**3. Standardized API Response Structure**

The backend is designed to return a consistent JSON response format for both successful and failed requests. This standardization simplifies frontend integration, reduces the complexity of error handling, and makes the application easier to debug and maintain. By using a predictable response structure, new features and API endpoints can be added with minimal changes to the existing frontend code, resulting in a more scalable and reliable application.
