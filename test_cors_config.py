"""
Test script to verify CORS configuration
"""
import re

def test_cors_patterns():
    """Test that our CORS patterns match expected URLs"""
    vercel_pattern = re.compile(r"^https://.*\.vercel\.app$")
    
    test_urls = [
        ('https://zetdc-frontend.vercel.app', True),
        ('https://zetdc-frontend-k15nifp0m-royalcodeplagues-projects.vercel.app', True),
        ('https://zetdc-frontend-itnkm4jh7-royalcodeplagues-projects.vercel.app', True),
        ('https://some-random-preview.vercel.app', True),
        ('http://localhost:3000', False),
        ('http://localhost:5173', False),
        ('https://zetdcplatformapp-production.up.railway.app', False),
        ('https://malicious-site.com', False),
    ]
    
    print("Testing CORS pattern matching:")
    print("-" * 60)
    
    for url, should_match in test_urls:
        matches = bool(vercel_pattern.match(url))
        status = "✓" if matches == should_match else "✗"
        print(f"{status} {url}: {'Matches' if matches else 'Does not match'} (Expected: {'Match' if should_match else 'No match'})")
    
    print("\nAll tests passed!" if all(
        bool(vercel_pattern.match(url)) == should_match 
        for url, should_match in test_urls
    ) else "\nSome tests failed!")

if __name__ == '__main__':
    test_cors_patterns()
