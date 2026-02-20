pipeline {
    agent any

    stages {

        stage('Clone') {
            steps {
                echo 'Cloning repository...'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker Image...'
                bat 'docker build -t capstone-backend ./backend'
            }
        }

        stage('Deploy Container') {
            steps {
                echo 'Removing old container if exists...'
                bat 'docker rm -f auth-backend-container || exit 0'
                echo 'Starting fresh container...'
                bat 'docker compose up -d --build'
            }
        }
    }
}
