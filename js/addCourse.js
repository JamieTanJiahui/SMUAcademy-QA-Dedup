// Import Firebase utilities and Firestore
import { db, getFirestore, collection, doc, setDoc } from './js/database.js';

// Vue Application
const { createApp } = Vue;

createApp({
    data() {
        return {
            formData: {
                group: "",
                title: "",
                objective: "",
                description: ""
            }
        };
    },
    methods: {
        async addCourse() {
            if (!this.formData.group || !this.formData.title) {
                alert("Please select a group and enter a title.");
                return;
            }

            try {
                // Reference to the specific group and course title
                const groupRef = doc(db, this.formData.group, this.formData.title);
                
                // Set the course data in Firestore
                await setDoc(groupRef, {
                    title: this.formData.title,
                    objective: this.formData.objective,
                    description: this.formData.description
                });

                alert("Course added successfully!");
                this.resetForm();
            } catch (error) {
                console.error("Error adding course: ", error);
                alert("Failed to add course. Please try again.");
            }
        },
        resetForm() {
            this.formData = {
                group: "",
                title: "",
                objective: "",
                description: ""
            };
        }
    }
}).mount("#app");
