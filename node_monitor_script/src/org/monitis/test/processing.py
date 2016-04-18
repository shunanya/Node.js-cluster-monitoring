import sys, json

def getCorrectValue(obj):
    try:
        ret = float(obj)
    except ValueError :
        try:
            ret = int(obj)
        except ValueError :
            ret = str(obj)
    return ret
    
def processing(path):
    lines = tuple(open(path, 'r')) #[line.strip() for line in open(new_path)]
    result = {}
    for line in lines :
        worker = 'w?'
        if 'worker' in line :
            pos = line.find('worker:')+len('worker:')
            endpos = line.find(';', pos)
            worker = line[pos:endpos]
        print('processing worker '+str(worker)+ '\n' +line)
        wpos = -1
        if result.has_key('worker') and worker in result['worker'] :
            wpos = result['worker'].index(worker)
        print('wpos = '+str(wpos))
        l = line.split('|', 2)
        if len(l) > 0 :
            for item in l[0].split(';') :
                i = item.split(':')
                if not i[0] in result :
                    result[i[0]] = []
                t = getCorrectValue(i[1])
                if wpos >= 0 :
                    result[i[0]][wpos] = t
                else :
                result[i[0]].append(t)
#                 if i[0] == 'worker':
#                     worker = t
            print(str(result))
        if len(l) > 1 :
            ad_result = json.loads(l[1])
            ad_result['worker'] = worker
            
    result_str = str(result).strip('{').rstrip('}').replace(',', ';')
    print('result\n'+str(result_str))            

if __name__ == "__main__":
    if len(sys.argv) > 1 :
        filename = sys.argv[1]
    else :
        filename = '/home/vesta/log/monitor_result'
    processing(filename)
