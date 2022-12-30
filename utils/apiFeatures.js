class ApiFeatures {
    //mongoose query , route queryStr
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    filter() {
        // 1 - filtering
        const queryObj = { ...this.queryString };
        const excluded = ['page', 'sort','limit', 'fields'];
        excluded.forEach(el => delete queryObj[el]);
        
        //console.log(this.query, queryObj);
        
        // 2 - advanced filtering
        let queryString = JSON.stringify(queryObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        //console.log(JSON.parse(queryString));
        
        this.query = this.query.find(JSON.parse(queryString));

        return this;
    }

    sort() {
         // 3 - sorting
        if(this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
            console.log(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        // 4 - field limiting
        if(this.queryStr.fields){ 
            const fields = this.queryStr.fields.split(',').join(' '); 
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;

    }

    paginate() {
        // 5 - pagination
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;
        const skip = (page - 1) * limit; 

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }    
}

module.exports = ApiFeatures;