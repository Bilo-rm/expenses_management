# Use the official Python 3.8 slim image as the base image
FROM python:3.10-slim

# Set the working directory within the container
WORKDIR /Expenses-service

# Copy the requirements file into the working directory
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of  application code
COPY . .

# run your app
CMD ["python", "app.py"]

# port  app runs on
EXPOSE 5000