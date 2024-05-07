FROM node
 
WORKDIR /app
 
COPY package*.json ./
 
RUN npm install
 
EXPOSE 7890
 
CMD ["node","App.js"]