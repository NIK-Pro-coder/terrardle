import sys

cmdict = {}

#Decorator to automatically rgister
#functions as callable with the cli
def addEntry(func) :
	cmdict[func.__name__] = func
	return func

if __name__ == "__main__" :
	cmdict[sys.argv[1]](*sys.argv[2:])
