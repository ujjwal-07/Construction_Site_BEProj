from email.mime import image
from operator import le
from tkinter import Frame
from traceback import print_tb
from unicodedata import name
import face_recognition
import cv2
import numpy as np
import csv
import os
import urllib.request
from datetime import datetime
from datetime import date
import webbrowser  





path = 'Images_of_students'
image = [] 
classNames = []
myList = os.listdir(path)
print(myList)
for cl in myList:
    curImg = cv2.imread(f'{path}/{cl}')
    image.append(curImg)
    classNames.append(os.path.splitext(cl)[0])
print(classNames)

def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode  = face_recognition.face_encodings(img)[0]
        encodeList.append(encode)
    return encodeList

def markAttendance(name):
    with open('Attendancedata.csv','r+') as f:
        DataList = f.readlines()
        nameList = []
        for line in DataList:
            entry = line.split(',')
            nameList.append(entry[0])
            print(nameList,"nameList")
        if name in nameList:
            with open('Attendancedata.csv', 'r') as csvfile:
                # create a CSV reader object
                csvreader = csv.reader(csvfile)

                # get the header row and find the column index to update
                header = next(csvreader)
                col_index = header.index('Attendance')
                col_index2 = header.index('Name')

                # create a list to store the updated rows
                updated_rows = []
                
                # loop through each row in the CSV file
                for row in csvreader:
                    # update the value in the desired column
                    if row[col_index2] == name:
                        url = "http://localhost:8080/update/"+name 
                        webbrowser.open_new_tab(url)   
                        # return "http://localhost:8080/update/"+name
                        print("Nmaeee is thiss",name)
                        row[col_index] = int(row[col_index]) + 1
                    # add the updated row to the list
                    updated_rows.append(row)

            # open the same CSV file in write mode to update its contents
            with open('Attendancedata.csv', 'w', newline='') as csvfile:
                # create a CSV writer object
                csvwriter = csv.writer(csvfile)

                # write the header row
                csvwriter.writerow(header)

                # write the updated rows
                csvwriter.writerows(updated_rows)

                return


        if name not in nameList:
            now = datetime.now()
            date_today = date.today()
            dtstring = now.strftime('%H:%M:%S')
#
#
            f.writelines(f'\n{name},{dtstring},{date_today},0')




encodeListKnown = findEncodings(image)
# print(len(encodeListKnown))
print("Encoding Complete")

cap = cv2.VideoCapture(0)

while True:
    success, img = cap.read()
    imgs = cv2.resize(img,(0,0),None,0.25,0.25)
    imgs = cv2.cvtColor(imgs, cv2.COLOR_BGR2RGB)
    found = False

    facesCurFrame = face_recognition.face_locations(imgs)
    encodeCurFrame  = face_recognition.face_encodings(imgs,facesCurFrame)

    for encodeFace, faceLoc in zip(encodeCurFrame, facesCurFrame):
        matches = face_recognition.compare_faces(encodeListKnown,encodeFace)
        faceDist = face_recognition.face_distance(encodeListKnown,encodeFace)
        print(faceDist)
        matchIndex= np.argmin(faceDist)

        if matches[matchIndex]:
            name = classNames[matchIndex].upper()
            y1,x2,y2,x1 = faceLoc
            y1, x2, y2, x1 = y1*4, x2*4, y2*4, x1*4
            cv2.rectangle(img,(x1,y1),(x2,y2),(0,255,0),2)
            cv2.rectangle(img,(x1,y2-35),(x2,y2),(0,255,0),cv2.FILLED)
            cv2.putText(img, name,(x1+6,y2-6),cv2.FONT_HERSHEY_PLAIN,1,(255,255,255),2)
            cv2.destroyAllWindows()
            found = True
            markAttendance(name)
    

    cv2.imshow('Webcam',img)
    key = cv2.waitKey(1)
    if found:
        break
    if key == 27:
        break

