from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

# Set up WebDriver
driver = webdriver.Chrome(executable_path="path/to/chromedriver")

# Open the webpage
driver.get("https://example.com/job-application")

# Fill out the form fields
name_field = driver.find_element(By.NAME, "name")
name_field.send_keys("John Doe")

email_field = driver.find_element(By.NAME, "email")
email_field.send_keys("johndoe@example.com")

submit_button = driver.find_element(By.ID, "submit")
submit_button.click()

# Close the browser
driver.quit()