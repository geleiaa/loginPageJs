const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const ApiFeatures = require('./../utils/apiFeatures');


// Factory Function para substituir os handlers dos controllers...

const getAll = Model => catchAsync(async (req, res) =>{

    let filtro = {};
    if(req.params.beerId) filtro = { beer: req.params.beerId } // Nested Routes de review pra beer

    // cria new Obj ApiFeatures com mongoose query e route query
    // depois chama os metodos do Obj formando a query
    // no fim execute query com await
    const features = new ApiFeatures(Model.find(filtro), req.query)
    .filter()
    .sort() 
    .limitFields()
    .paginate();


    const doc = await features.query // explain() para estatisticas da query no DB;

    res.status(200).json({
        status: "success",
        results: doc.length,
        //time: req.reqTime,
        data: {
            doc
        }
    });
});

const getOne = (Model, popuOptions) => catchAsync(async (req, res, next) =>{
    
    let query = Model.findById(req.params.id);
    if(popuOptions) query = query.populate(popuOptions);
    const doc = await query;
    
    if (!doc) {
        return next(new AppError(`No found ${doc} with that ID`, 404));
    }        

    res.status(200).json({
        status: "success",
        data: {
            beers: doc
        }
    });
});

const deleteOne = Model => catchAsync(async (req, res) =>{
    
    const doc = await Model.findByIdAndRemove(req.params.id);

    if (!doc) {
        return next(new AppError(`No found ${doc} with that ID`, 404));
    }

    res.status(204).json({
        status: "success",
        message: `${doc.name} deleted`,
        data: doc
    });
});

const updateOne = Model => catchAsync(async (req, res) =>{
    
    const doc = await Model.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        { 
            new: true,
            runValidators: true 
        }
    );

    if (!doc) {
        return next(new AppError(`No found ${doc} with that ID`, 404));
    }
        
    res.status(200).json({
        status: "success",
        data: {
            doc
        }
    });
});

const createOne = Model => catchAsync (async (req, res) =>{

    const doc = await Model.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            doc: doc
        }
    });   
});   

module.exports = {
    getAll,
    getOne,
    deleteOne,
    updateOne,
    createOne
}