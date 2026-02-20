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
                echo 'Running Docker Container...'
                bat 'docker compose up -d'
            }
        }
    }
}
