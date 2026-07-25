import zipfile
import xml.etree.ElementTree as ET
import os

def create_docx(filename):
    # Minimal Word Document structure
    content_types = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>'''

    rels = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

    document_xml = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:b/>
          <w:sz w:val="48"/>
          <w:color w:val="0284C7"/>
        </w:rPr>
        <w:t>TradeFlow ERP + CRM Operations Portal</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r>
        <w:rPr><w:i/><w:sz w:val="24"/><w:color w:val="64748B"/></w:rPr>
        <w:t>Comprehensive Technical &amp; Operational Documentation</w:t>
      </w:r>
    </w:p>
    <w:p/>

    <!-- Heading 1: Executive Summary -->
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F172A"/></w:rPr>
        <w:t>1. Executive Summary &amp; Business Context</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:t>TradeFlow Operations Portal is an enterprise-grade, cloud-native Mini ERP and CRM system engineered specifically for wholesale, distribution, and supply chain enterprises. The platform unifies multi-department operations into an interactive dashboard comprising Sales CRM, Product Cataloging, Inventory Guardrails, Sales Challans, Purchase Orders, and Invoices.</w:t>
      </w:r>
    </w:p>

    <!-- Heading 1: Deployment & System Matrix -->
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F172A"/></w:rPr>
        <w:t>2. Live Deployment &amp; System Matrix</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>GitHub Source Code Repository: </w:t></w:r>
      <w:r><w:t>https://github.com/kotagirisrilaxmi06/trade-flow-</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Live Frontend Web Application: </w:t></w:r>
      <w:r><w:t>https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Live Serverless Backend API: </w:t></w:r>
      <w:r><w:t>https://trade-flow-cnc8oix2v-kotagirisrilaxmi06s-projects.vercel.app/health</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Database Engine: </w:t></w:r>
      <w:r><w:t>Neon Cloud PostgreSQL (PostgreSQL 18.4 AWS ap-southeast-1)</w:t></w:r>
    </w:p>

    <!-- Credentials -->
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="0284C7"/></w:rPr>
        <w:t>Role-Based Test Credentials</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• Admin Role: </w:t></w:r><w:r><w:t>admin@example.com / password123 (Full system access)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• Sales Role: </w:t></w:r><w:r><w:t>sales@example.com / password123 (CRM, Follow-ups, Challans creation)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• Warehouse Role: </w:t></w:r><w:r><w:t>warehouse@example.com / password123 (Products &amp; Stock movements log)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• Accounts Role: </w:t></w:r><w:r><w:t>accounts@example.com / password123 (Purchase Orders &amp; Invoices)</w:t></w:r></w:p>

    <!-- Heading 1: System Architecture -->
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F172A"/></w:rPr>
        <w:t>3. System Architecture &amp; Technology Stack</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:t>The platform uses a Unified Monorepo Architecture. The React 18 frontend is compiled with Vite and served statically by Vercel. All REST API endpoints (/auth, /customers, /products, /challans, /purchase-orders, /invoices, /health) are rewritten by vercel.json to the serverless entrypoint at /api/index.ts. The serverless Express application connects directly to Neon Cloud PostgreSQL using an SSL connection pool (pg.Pool).</w:t></w:r>
    </w:p>

    <!-- Heading 1: Core Modules -->
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F172A"/></w:rPr>
        <w:t>4. Core Dashboard Modules &amp; Business Logic</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>1. Executive Analytics &amp; Challan Performance Graph: </w:t></w:r><w:r><w:t>Real-time KPI metrics for sales revenue, pipeline drafts, active dealers, and low-stock alerts, accompanied by a visual Challan status distribution graph.</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>2. Customer &amp; Dealer CRM Matrix: </w:t></w:r><w:r><w:t>Categorizes accounts (Retail, Wholesale, Distributor), total deals issued, revenue contributed, status tags, and timestamped follow-up history logs.</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>3. Products &amp; Stock Guardrails: </w:t></w:r><w:r><w:t>Catalog management with minimum stock alert warnings and immutable stock movement logging (IN/OUT).</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>4. Sales Challan Engine: </w:t></w:r><w:r><w:t>Auto-numbering (CH-YYYYMMDD-XXXX), immutable product snapshots, and atomic stock validation (rejects confirmation requests if stock is insufficient).</w:t></w:r></w:p>

    <!-- Heading 1: API Specifications -->
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F172A"/></w:rPr>
        <w:t>5. REST API Technical Specifications</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• GET /health - </w:t></w:r><w:r><w:t>Health check endpoint (200 OK)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• POST /auth/login - </w:t></w:r><w:r><w:t>User login authentication (200 OK)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• GET /customers &amp; POST /customers - </w:t></w:r><w:r><w:t>Fetch and register customer profiles (200 OK / 201 Created)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• POST /customers/:id/follow-ups - </w:t></w:r><w:r><w:t>Add customer follow-up interaction note (201 Created)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• GET /products &amp; POST /products - </w:t></w:r><w:r><w:t>Fetch and register products (200 OK / 201 Created)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• POST /products/:id/stock-movements - </w:t></w:r><w:r><w:t>Log stock IN/OUT adjustments (201 Created)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• GET /challans &amp; POST /challans - </w:t></w:r><w:r><w:t>List and issue sales challans with atomic stock validation (200 OK / 201 Created)</w:t></w:r></w:p>
    <w:p><w:r><w:rPr><w:b/></w:rPr><w:t>• GET /invoices &amp; POST /invoices - </w:t></w:r><w:r><w:t>List and generate customer billing invoices (200 OK / 201 Created)</w:t></w:r></w:p>
  </w:body>
</w:document>'''

    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as docx:
        docx.writestr('[Content_Types].xml', content_types)
        docx.writestr('_rels/.rels', rels)
        docx.writestr('word/document.xml', document_xml)
    print(f"DOCX created successfully at {filename}")

if __name__ == '__main__':
    target = r"c:\Users\kotag\OneDrive\Documents\GitHub\talking-tom\TradeFlow_Documentation.docx"
    create_docx(target)
