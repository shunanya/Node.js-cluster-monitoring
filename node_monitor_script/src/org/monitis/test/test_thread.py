import thread
import time

# Define a function for the thread
def print_time( threadName, delay):
	count = 0
	while count < 5:
		time.sleep(delay)
		count += 1
		print "%s(%s): %s" % ( threadName, thread._count(), time.ctime(time.time()) )

# Create two threads as follows
try:
	thread.start_new_thread( print_time, ("Thread-1", 1, ) )
	thread.start_new_thread( print_time, ("Thread-2", 2, ) )
except:
	print "Error: unable to start thread"

while 1:
	time.sleep(1)
	if thread._count() <= 0 :
		thread.exit()
		
