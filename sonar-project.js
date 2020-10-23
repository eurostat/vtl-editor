const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner(
    {
        serverUrl: "https://citnet.tech.ec.europa.eu/CITnet/sonarqube",
        token: "77ba25ddd91742386349304067faab23816ef22e",
        options: {
            "sonar.sources": "./src",
            "sonar.projectKey": "VRM-RULEMANAGER",
            "sonar.exclusions": "**grammar/**/VtlLexer.ts, **grammar/**/VtlListener.ts, **grammar/**/VtlParser.ts, **grammar/**/suggestions.ts, **grammar/**/VtlVisitor.ts, **grammar/antlr4/**",
            // "sonar.tests": "./src/__tests__",
            // "sonar.test.inclusions": "./src/__tests__/**/*.test.tsx,./src/__tests__/**/*.test.ts",
            "sonar.typescript.lcov.reportPaths": "coverage/lcov.info",
            // "sonar.testExecutionReportPaths": "reports/test-report.xml",
        },
    },
    () => {},
);
