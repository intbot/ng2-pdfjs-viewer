# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 25.x.x  | :white_check_mark: |
| 24.x.x  | :white_check_mark: |
| 23.x.x  | :x:                |
| < 23.x  | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in ng2-pdfjs-viewer, please follow these guidelines:

### 🔒 Private Vulnerability Reporting

**Please do NOT report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report security vulnerabilities privately by:

1. **Email**: Send details to [codehippie1@gmail.com](mailto:codehippie1@gmail.com)
2. **GitHub Security Advisories**: Use the "Report a vulnerability" button on the [Security tab](https://github.com/intbot/ng2-pdfjs-viewer/security)
3. **Responsible Disclosure**: Follow responsible disclosure practices

### 📝 What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact Assessment**: Potential impact and affected components
- **Environment**: Browser, Angular version, ng2-pdfjs-viewer version
- **Proof of Concept**: If applicable, include a minimal reproduction case
- **Suggested Fix**: If you have ideas for a fix, please share them

### 🏆 Security Hall of Fame

We recognize security researchers who help improve ng2-pdfjs-viewer security:

- [Your Name] - CVE-XXXX-XXXX - Description of contribution
- [Another Researcher] - CVE-XXXX-XXXX - Description of contribution

## Security Considerations

### CSP (Content Security Policy) Compliance

ng2-pdfjs-viewer is designed to work with strict Content Security Policies:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               style-src 'self'; 
               script-src 'self';">
```

**Note**: v25.0.11+ includes fixes for CSP compliance issues with inline styles.

### iframe Security

The component uses iframe sandboxing for security:

```html
<iframe sandbox="allow-forms allow-scripts allow-same-origin allow-modals">
```

### PDF.js Security

ng2-pdfjs-viewer is built on [PDF.js](https://mozilla.github.io/pdf.js/), which includes:

- **XSS Protection**: Built-in protection against malicious PDF content
- **Sandboxing**: Isolated execution environment
- **Regular Updates**: Following PDF.js security updates

## Security Best Practices

### For Developers

1. **Keep Dependencies Updated**: Regularly update Angular and PDF.js dependencies
2. **Use HTTPS**: Always serve PDFs over HTTPS in production
3. **Validate Input**: Validate PDF sources and user inputs
4. **CSP Headers**: Implement proper Content Security Policy headers
5. **Error Handling**: Don't expose sensitive information in error messages

### For Users

1. **Update Regularly**: Keep ng2-pdfjs-viewer updated to the latest version
2. **Secure Sources**: Only load PDFs from trusted sources
3. **HTTPS**: Use HTTPS when serving PDFs
4. **Review Permissions**: Be cautious with PDFs that request special permissions

## Known Security Issues

### Resolved Issues

- **CSP Inline Style Violations** (v25.0.11): Fixed inline style CSP violations in component template
- **XSS Prevention**: iframe sandboxing prevents PDF-based XSS attacks
- **URL Validation**: Built-in URL validation prevents unauthorized file access

### Current Limitations

- **PDF.js Vulnerabilities**: Inherits any security issues from PDF.js core
- **Browser Security**: Relies on browser security for iframe isolation
- **Network Security**: PDF loading depends on network security

## Security Updates

Security updates are typically released as:

- **Patch Releases**: For critical security fixes (e.g., 25.0.12)
- **Minor Releases**: For important security improvements (e.g., 25.1.0)
- **Major Releases**: For significant security architecture changes (e.g., 26.0.0)

## Contact Information

- **Security Issues**: [security@example.com](mailto:codehippie1@gmail.com)
- **General Support**: [GitHub Issues](https://github.com/intbot/ng2-pdfjs-viewer/issues)
- **Documentation**: [Documentation Site](https://angular-pdf-viewer-docs.vercel.app/)

## Acknowledgments

We thank the security community for their contributions to making ng2-pdfjs-viewer more secure. Special thanks to:

- The PDF.js team at Mozilla for their security-focused approach
- Angular team for security best practices
- All security researchers who have reported vulnerabilities

---

**Last Updated**: January 2025  
**Version**: 25.0.12
