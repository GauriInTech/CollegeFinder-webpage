import requests
from bs4 import BeautifulSoup
import json
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

base_url = "https://shikshan.org/colleges-courses/india-colleges/"

def create_session():
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=0.3, status_forcelist=[500, 502, 503, 504])
    session.mount('http://', HTTPAdapter(max_retries=retries))
    session.mount('https://', HTTPAdapter(max_retries=retries))
    return session

def fetch_page_content(session, url):
    try:
        response = session.get(url)
        response.raise_for_status()  # Check for HTTP errors
        return response.text
    except requests.RequestException as e:
        print(f'Error fetching page: {e}')
        return None

def parse_college_data(soup):
    college_data_list = []
    ebl_divs = soup.find_all('div', class_='ebl')

    for ebl_div in ebl_divs:
        # Extract the college name from h2
        college_name = ebl_div.find('h2').text.strip()

        # Extract the address
        address_divs = ebl_div.find_all('div')
        address = address_divs[1].text.strip() if len(address_divs) > 1 else None

        # Extract the contact number and email
        contact_number = None
        email = None
        contact_email_div = address_divs[2] if len(address_divs) > 2 else None
        if contact_email_div:
            for span in contact_email_div.find_all('span', class_='crlist'):
                if 'Contact Number' in span.text:
                    contact_number = span.text.split(':')[1].strip()
                elif 'Email' in span.text:
                    email = span.text.split(':')[1].strip()

        # Extract the courses
        courses = []
        course_spans = ebl_div.find_all('span', class_='crlist')
        for span in course_spans:
            course_text = span.text.strip()
            if 'Course' in course_text:
                courses.append(course_text)

        college_data = {
            'college_name': college_name,
            'address': address,
            'contact_number': contact_number,
            'email': email,
            'courses': courses
        }
        college_data_list.append(college_data)

    return college_data_list

def get_data_from_page(session, url):
    html = fetch_page_content(session, url)
    if html:
        soup = BeautifulSoup(html, 'html.parser')
        return parse_college_data(soup)
    return []

def scrape_pages_in_chunks(start_page, end_page, chunk_size):
    all_data = []
    session = create_session()

    for start in range(start_page, end_page + 1, chunk_size):
        end = min(start + chunk_size - 1, end_page)
        print(f'Scraping pages {start} to {end}...')
        urls = [f"{base_url}{page}/" for page in range(start, end + 1)]

        for url in urls:
            college_data = get_data_from_page(session, url)
            if college_data:
                all_data.extend(college_data)

        time.sleep(2)  # Sleep to avoid overwhelming the server

    return all_data

def save_to_json(data, filename='colleges_data.json'):
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f'Data successfully saved to {filename}')
    except IOError as e:
        print(f'Error saving data to JSON: {e}')

# Example usage:
start_page = 1
end_page = 742  # Adjust this based on the total number of pages
chunk_size = 50  # Number of pages to scrape per chunk
all_data = scrape_pages_in_chunks(start_page, end_page, chunk_size)

# Save the data to a JSON file
save_to_json(all_data, 'API.json')